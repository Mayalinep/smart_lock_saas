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
  securityHeaders 
} = require('./src/middleware/security');
const { logRequest, logError, logger } = require('./src/utils/logger');

// Import des routes
const authRoutes = require('./src/routes/auth');
const propertyRoutes = require('./src/routes/properties');
const accessRoutes = require('./src/routes/access');
const healthRoutes = require('./src/routes/health');

// Import du middleware d'erreur
const { errorHandler } = require('./src/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de monitoring et sécurité
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
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
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/access', accessRoutes);
app.use('/api', healthRoutes);

// Middleware de gestion d'erreurs avec logging
app.use(logError);
app.use(errorHandler);

// Démarrage du serveur avec logging
app.listen(PORT, () => {
  logger.info(`🚀 Serveur démarré sur le port ${PORT}`);
  logger.info(`📊 Environnement: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔒 Monitoring activé`);
}); 