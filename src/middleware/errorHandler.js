/**
 * Middleware de gestion des erreurs global
 * Doit être le dernier middleware dans l'application
 */
const errorHandler = (err, req, res, next) => {
  console.error('Erreur capturée:', err);

  // Erreur de validation Prisma
  if (err.name === 'PrismaClientValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Données invalides',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  // Erreur de contrainte unique Prisma
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'Cette ressource existe déjà',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token invalide'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expiré'
    });
  }

  // Erreur de validation personnalisée
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: err.message,
      errors: err.errors || []
    });
  }

  // Erreur 404
  if (err.status === 404) {
    return res.status(404).json({
      success: false,
      message: 'Ressource non trouvée'
    });
  }

  // Erreur générique
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erreur interne du serveur',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

/**
 * Middleware pour les routes non trouvées
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route non trouvée: ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

module.exports = {
  errorHandler,
  notFound,
}; 