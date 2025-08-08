require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

// Import des middlewares de sécurité et monitoring
const { 
  corsOptions, 
  spamDetection,
  authLimiter, 
  apiLimiter, 
  speedLimiter,
  registerLimiter,
  accessLimiter,
  securityHeaders,
  userRateLimit
} = require('./src/middleware/security');
const { logRequest, logError, logger, requestIdMiddleware } = require('./src/utils/logger');
const { httpMetricsMiddleware, register } = require('./src/services/metrics');
const swaggerUi = require('swagger-ui-express');
const { openapiSpec } = require('./src/docs/openapi');

// Import des routes
const authRoutes = require('./src/routes/auth');
const propertyRoutes = require('./src/routes/properties');
const accessRoutes = require('./src/routes/access');
const lockRoutes = require('./src/routes/lock');
const healthRoutes = require('./src/routes/health');
const webhookRoutes = require('./src/routes/webhooks');

// Import du middleware d'erreur
const { errorHandler } = require('./src/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de monitoring et sécurité
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
app.use(requestIdMiddleware);
app.use(httpMetricsMiddleware);
app.use(logRequest);
app.use(securityHeaders);

// CORS avec configuration sécurisée
app.use(require('cors')(corsOptions));

// Anti-spam global
app.use(spamDetection);

// Speed limiting pour ralentir les requêtes suspectes
app.use('/api/', speedLimiter);

// Rate limiting global
app.use('/api/', apiLimiter);

// Rate limiting spécifique pour l'auth
app.use('/api/auth', authLimiter);

// Rate limiting pour les inscriptions (anti-spam)
app.use('/api/auth/register', registerLimiter);

// Rate limiting pour les accès (anti-squatteur)
app.use('/api/access', accessLimiter);

// Middleware pour parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes avec monitoring
// Pour les routes authentifiées, on appliquera userRateLimit dans les routeurs ciblés si besoin
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
// Applique rate-limit par utilisateur aux routes sensibles protégées
app.use('/api/access', userRateLimit(process.env.NODE_ENV === 'production' ? 100 : 300), accessRoutes);
app.use('/api/lock', lockRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api', healthRoutes);

// Expose Prometheus metrics (remplace contenu health /metrics si nécessaire)
app.get('/api/metrics', async (_req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Swagger UI et spec
app.get('/api/openapi.json', (_req, res) => res.json(openapiSpec));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));

// Middleware de gestion d'erreurs avec logging
app.use(logError);
app.use(errorHandler);

// Démarrage du serveur avec logging (pas en test)
let server = null;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    logger.info(`🚀 Serveur démarré sur le port ${PORT}`);
    logger.info(`📊 Environnement: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`🔒 Monitoring activé`);
  });
}

// Arrêt gracieux
async function shutdown(signal) {
  if (global.__isShuttingDown) return;
  global.__isShuttingDown = true;
  logger.info(`🛑 Reçu ${signal}, arrêt gracieux...`);
  try {
    // fermer HTTP
    if (server) {
      await new Promise((resolve) => server.close(resolve));
      logger.info('✅ HTTP fermé');
    }
  } catch (e) {
    logger.error('Erreur fermeture HTTP', { error: e.message });
  }
  try {
    // fermer Prisma (via process.on in config), rien à faire ici
  } catch (_) {}
  try {
    // fermer Redis/queues si présents
    const cache = require('./src/services/cache');
    const { shutdownQueues } = require('./src/queues/emailQueue');
    const { shutdownWebhookQueues } = require('./src/queues/webhookQueue');
    await shutdownQueues?.();
    await shutdownWebhookQueues?.();
    await cache.quit?.();
  } catch (e) {
    logger.error('Erreur fermeture ressources', { error: e.message });
  }
  process.exit(0);
}

['SIGTERM', 'SIGINT'].forEach(sig => {
  process.on(sig, () => shutdown(sig));
});

module.exports = app;