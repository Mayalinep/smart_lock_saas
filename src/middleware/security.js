const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const { incrementAndGet } = require('../services/rateLimiter');

// Configuration CORS
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Système anti-spam avancé
const spamDetection = (req, res, next) => {
  const userAgent = req.get('User-Agent') || '';
  const ip = req.ip;
  
  // En développement, être moins strict
  if (process.env.NODE_ENV !== 'production') {
    // En dev, bloquer seulement les vrais bots
    const strictSpamIndicators = [
      /bot|crawler|spider/i,
      /scraper|harvester/i,
      /python|java|perl/i
    ];
    
    const isStrictSpam = strictSpamIndicators.some(pattern => pattern.test(userAgent));
    
    if (isStrictSpam) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé - User-Agent suspect'
      });
    }
  } else {
    // En production, être plus strict
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
  }
  
  next();
};

// Rate limiting anti-spam pour l'authentification
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 5 : 20, // Plus permissif en dev
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
  max: process.env.NODE_ENV === 'production' ? 100 : 500, // Plus permissif en dev
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
  delayAfter: process.env.NODE_ENV === 'production' ? 50 : 200, // Plus permissif en dev
  delayMs: (used, req) => {
    const delayAfter = req.slowDown.limit;
    const delay = process.env.NODE_ENV === 'production' ? 500 : 100;
    return (used - delayAfter) * delay;
  },
  maxDelayMs: process.env.NODE_ENV === 'production' ? 20000 : 5000, // Délai max plus faible en dev
  keyGenerator: (req) => req.ip,
  skipSuccessfulRequests: false
});

// Rate limiting spécifique pour les inscriptions (anti-spam)
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: process.env.NODE_ENV === 'production' ? 3 : 10, // Plus permissif en dev
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
  max: process.env.NODE_ENV === 'production' ? 10 : 50, // Plus permissif en dev
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
  validateCSRF,
  // Middlewares personnalisés par utilisateur
  loginRateLimit: async (req, res, next) => {
    if (process.env.NODE_ENV === 'test') return next();
    try {
      const ip = req.ip || 'unknown';
      const email = req.body?.email || 'unknown';
      const key = `login:${email}:${ip}`;
      const { allowed, remaining, resetSeconds } = await incrementAndGet(key, 60, process.env.NODE_ENV === 'production' ? 5 : 20);
      if (!allowed) {
        return res.status(429).json({ success: false, message: 'Trop de tentatives de connexion. Réessayez plus tard.', retryAfter: resetSeconds });
      }
      return next();
    } catch (e) {
      return next();
    }
  },
  userRateLimit: (limitPerHour = 100) => {
    return async (req, res, next) => {
      if (process.env.NODE_ENV === 'test') return next();
      try {
        const userId = req.user?.userId || req.ip || 'anonymous';
        const key = `user:${userId}`;
        const { allowed, remaining, resetSeconds } = await incrementAndGet(key, 60 * 60, limitPerHour);
        if (!allowed) {
          return res.status(429).json({ success: false, message: 'Limite de requêtes par utilisateur atteinte. Réessayez plus tard.', retryAfter: resetSeconds });
        }
        return next();
      } catch (e) {
        return next();
      }
    };
  }
}; 