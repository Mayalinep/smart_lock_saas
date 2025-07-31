const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

// Configuration CORS
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Système anti-spam avancé
const spamDetection = (req, res, next) => {
  const userAgent = req.get('User-Agent') || '';
  const ip = req.ip;
  
  // Détection de bots/spam
  const spamIndicators = [
    /bot|crawler|spider/i,
    /scraper|harvester/i,
    /curl|wget/i,
    /python|java|perl/i
  ];
  
  const isSpam = spamIndicators.some(pattern => pattern.test(userAgent));
  
  if (isSpam) {
    return res.status(403).json({
      success: false,
      message: 'Accès refusé - User-Agent suspect'
    });
  }
  
  next();
};

// Rate limiting anti-spam pour l'authentification
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives par fenêtre
  message: {
    success: false,
    message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  skipSuccessfulRequests: true, // Ne pas compter les succès
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.',
      retryAfter: Math.ceil(15 * 60 / 1000) // 15 minutes en secondes
    });
  }
});

// Rate limiting pour l'API avec escalade progressive
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes par fenêtre
  message: {
    success: false,
    message: 'Trop de requêtes. Réessayez plus tard.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  skipSuccessfulRequests: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Trop de requêtes. Réessayez plus tard.',
      retryAfter: Math.ceil(15 * 60 / 1000)
    });
  }
});

// Slow down pour les requêtes suspectes
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // Commencer à ralentir après 50 requêtes
  delayMs: 500, // Ajouter 500ms de délai par requête supplémentaire
  maxDelayMs: 20000, // Délai maximum de 20 secondes
  keyGenerator: (req) => req.ip,
  skipSuccessfulRequests: false
});

// Rate limiting spécifique pour les inscriptions (anti-spam)
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 3, // 3 inscriptions par heure par IP
  message: {
    success: false,
    message: 'Trop d\'inscriptions. Réessayez dans 1 heure.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Trop d\'inscriptions depuis cette adresse IP. Réessayez dans 1 heure.',
      retryAfter: Math.ceil(60 * 60 / 1000) // 1 heure en secondes
    });
  }
});

// Rate limiting pour les accès (anti-squatteur)
const accessLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // 10 créations d'accès par 5 minutes
  message: {
    success: false,
    message: 'Trop de créations d\'accès. Réessayez dans 5 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Trop de créations d\'accès. Réessayez dans 5 minutes.',
      retryAfter: Math.ceil(5 * 60 / 1000) // 5 minutes en secondes
    });
  }
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
  spamDetection,
  authLimiter,
  apiLimiter,
  speedLimiter,
  registerLimiter,
  accessLimiter,
  securityHeaders,
  validateCSRF
}; 