const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cache = require('../services/cache');
const { logger } = require('../utils/logger');

const router = express.Router();
const prisma = new PrismaClient();

// Health check simple
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Service opérationnel',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Liveness: OK si le process tourne et pas en arrêt
router.get('/health/liveness', (_req, res) => {
  const shuttingDown = Boolean(global.__isShuttingDown);
  return res.status(shuttingDown ? 503 : 200).json({
    status: shuttingDown ? 'stopping' : 'ok',
    timestamp: new Date().toISOString(),
  });
});

// Health check détaillé avec vérification de la base de données
router.get('/health/detailed', async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Test de connexion à la base de données
    await prisma.$queryRaw`SELECT 1`;
    const dbResponseTime = Date.now() - startTime;
    
    // Statistiques de base de données
    const userCount = await prisma.user.count();
    const propertyCount = await prisma.property.count();
    const accessCount = await prisma.access.count();
    
    // Informations système
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    res.status(200).json({
      success: true,
      message: 'Service opérationnel avec détails',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      
      database: {
        status: 'connected',
        responseTime: `${dbResponseTime}ms`,
        statistics: {
          users: userCount,
          properties: propertyCount,
          accesses: accessCount
        }
      },
      
      system: {
        memory: {
          rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
          heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`
        },
        cpu: {
          user: `${Math.round(cpuUsage.user / 1000)}ms`,
          system: `${Math.round(cpuUsage.system / 1000)}ms`
        }
      }
    });
    
  } catch (error) {
    logger.error('Health check failed', { error: error.message });
    res.status(503).json({
      success: false,
      message: 'Service indisponible',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Readiness: vérifie DB + cache Redis
router.get('/health/readiness', async (_req, res) => {
  const result = { db: 'unknown', cache: 'unknown' };
  let ok = true;
  try {
    await prisma.$queryRaw`SELECT 1`;
    result.db = 'ready';
  } catch (e) {
    result.db = 'error';
    ok = false;
  }
  try {
    await cache.set('health:readiness', { t: Date.now() }, 5);
    const v = await cache.get('health:readiness');
    result.cache = v ? 'ready' : 'error';
    if (!v) ok = false;
  } catch (e) {
    result.cache = 'error';
    ok = false;
  }
  return res.status(ok ? 200 : 503).json({ status: ok ? 'ready' : 'not_ready', ...result, timestamp: new Date().toISOString() });
});

// Endpoint pour les métriques (format Prometheus)
router.get('/metrics', (req, res) => {
  const memoryUsage = process.memoryUsage();
  
  const cacheMetrics = cache.getMetrics();

  const metrics = `# HELP nodejs_heap_size_total Process heap size from Node.js in bytes.
# TYPE nodejs_heap_size_total gauge
nodejs_heap_size_total ${memoryUsage.heapTotal}

# HELP nodejs_heap_size_used Process heap size used from Node.js in bytes.
# TYPE nodejs_heap_size_used gauge
nodejs_heap_size_used ${memoryUsage.heapUsed}

# HELP nodejs_heap_size_rss Process heap size rss from Node.js in bytes.
# TYPE nodejs_heap_size_rss gauge
nodejs_heap_size_rss ${memoryUsage.rss}

# HELP nodejs_process_cpu_seconds_total Total user and system CPU time spent in seconds.
# TYPE nodejs_process_cpu_seconds_total counter
nodejs_process_cpu_seconds_total ${process.cpuUsage().user / 1000000}

# HELP nodejs_process_start_time_seconds Start time of the process since unix epoch in seconds.
# TYPE nodejs_process_start_time_seconds gauge
nodejs_process_start_time_seconds ${process.uptime()}`;

  const cacheSection = `
\n# HELP app_cache_hits Total cache hits
# TYPE app_cache_hits counter
app_cache_hits ${cacheMetrics.hits}

# HELP app_cache_misses Total cache misses
# TYPE app_cache_misses counter
app_cache_misses ${cacheMetrics.misses}

# HELP app_cache_hit_rate Cache hit rate (0-1)
# TYPE app_cache_hit_rate gauge
app_cache_hit_rate ${cacheMetrics.hitRate}
`;

  res.set('Content-Type', 'text/plain');
  res.send(metrics + cacheSection);
});

module.exports = router; 