const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Configuration CORS
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Rate limiting pour prévenir les attaques par force brute
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives par fenêtre
  message: {
    success: false,
    message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes par fenêtre
  message: {
    success: false,
    message: 'Trop de requêtes. Réessayez plus tard.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Middleware pour ajouter des headers de sécurité
const securityHeaders = (req, res, next) => {
  // Headers de sécurité supplémentaires
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
};

// Middleware pour valider les tokens CSRF (optionnel)
const validateCSRF = (req, res, next) => {
  // Pour les méthodes non-GET, vérifier le header CSRF
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const csrfToken = req.headers['x-csrf-token'];
    if (!csrfToken) {
      return res.status(403).json({
        success: false,
        message: 'Token CSRF manquant'
      });
    }
    // Ici tu pourrais ajouter une validation plus poussée du token
  }
  next();
};

module.exports = {
  corsOptions,
  authLimiter,
  apiLimiter,
  securityHeaders,
  validateCSRF
}; 