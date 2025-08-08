const { verifyToken } = require('../utils/jwt');
const { isBlacklisted } = require('../services/tokenBlacklist');
const prisma = require('../config/database');

/**
 * Middleware d'authentification
 * Vérifie la présence et validité du token JWT dans les cookies
 */
const authenticate = async (req, res, next) => {
  try {
    // 1. Lire le cookie nommé 'token' depuis req.cookies
    const token = req.cookies.token;

    // 2. Si le cookie est absent → erreur 401
    if (!token) {
      const error = new Error('Token manquant');
      error.status = 401;
      throw error;
    }

    // 3. Vérifier blacklist
    const blacklisted = await isBlacklisted(token);
    if (blacklisted) {
      const error = new Error('Token invalide');
      error.status = 401;
      throw error;
    }

    // 4. Utiliser verifyToken pour décoder le token
    const decoded = verifyToken(token);

    // 5. Si verifyToken ne lance pas d'erreur, le token est valide
    // 6. Attacher l'objet { userId: ... } à req.user
    req.user = { userId: decoded.userId };

    // 7. Appeler next() si tout est OK
    next();

  } catch (error) {
    // Si le token est invalide ou expiré → erreur 401
    const message = error.message === 'Token manquant' ? 'Token manquant' : 'Token invalide';
    
    res.status(401).json({ 
      success: false, 
      message: message
    });
  }
};

/**
 * Middleware pour vérifier les rôles utilisateur
 * @param {Array} allowedRoles - Rôles autorisés
 */
const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    // TODO: Vérifier que req.user existe
    // TODO: Vérifier que le rôle de l'utilisateur est dans allowedRoles
    // TODO: Appeler next() ou renvoyer une erreur 403
    
    // Placeholder pour le développement
    res.status(403).json({ 
      success: false, 
      message: 'Middleware d\'autorisation à implémenter' 
    });
  };
};

/**
 * Middleware optionnel d'authentification
 * N'interrompt pas la requête si pas de token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return next();
    const blacklisted = await isBlacklisted(token);
    if (blacklisted) return next();
    const decoded = verifyToken(token);
    req.user = { userId: decoded.userId };
    next();
  } catch (_) {
    next();
  }
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth,
}; 