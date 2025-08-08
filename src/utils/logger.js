const winston = require('winston');
const path = require('path');
const { randomUUID } = require('crypto');

// Configuration des formats de log
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Configuration des transports
const transports = [
  // Logs d'erreur dans un fichier
  new winston.transports.File({
    filename: path.join(__dirname, '../../logs/error.log'),
    level: 'error',
    format: logFormat,
    maxsize: 10 * 1024 * 1024, // 10MB
    maxFiles: 14
  }),
  
  // Tous les logs dans un fichier
  new winston.transports.File({
    filename: path.join(__dirname, '../../logs/combined.log'),
    format: logFormat,
    maxsize: 10 * 1024 * 1024, // 10MB
    maxFiles: 14
  })
];

// En développement, afficher aussi dans la console
if (process.env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  );
}

// Création du logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports,
  // Ne pas quitter en cas d'erreur
  exitOnError: false
});

// Middleware requestId (Correlation ID)
const requestIdMiddleware = (req, res, next) => {
  const existing = req.headers['x-request-id'];
  const requestId = existing && typeof existing === 'string' ? existing : randomUUID();
  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);
  next();
};

// Fonctions utilitaires pour le logging
const logRequest = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      requestId: req.requestId || 'n/a',
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.user?.userId || 'anonymous'
    };
    
    if (res.statusCode >= 400) {
      logger.warn('HTTP Request', logData);
    } else {
      logger.info('HTTP Request', logData);
    }
  });
  
  next();
};

const logError = (error, req, res, next) => {
  logger.error('Application Error', {
    requestId: req.requestId || 'n/a',
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    userId: req.user?.userId || 'anonymous',
    ip: req.ip
  });
  
  next(error);
};

module.exports = {
  logger,
  requestIdMiddleware,
  logRequest,
  logError
}; 