const express = require('express');
const { PrismaClient } = require('@prisma/client');
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

// Endpoint pour les métriques (format Prometheus)
router.get('/metrics', (req, res) => {
  const memoryUsage = process.memoryUsage();
  
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

  res.set('Content-Type', 'text/plain');
  res.send(metrics);
});

module.exports = router; 