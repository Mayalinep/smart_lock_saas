const { verifyToken } = require('../utils/jwt');
const prisma = require('../config/database');

/**
 * Middleware d'authentification
 * Vérifie la présence et validité du token JWT dans les cookies
 */
const authenticate = async (req, res, next) => {
  try {
    // TODO: Récupérer le token depuis les cookies
    // TODO: Vérifier le token avec verifyToken
    // TODO: Récupérer l'utilisateur en base
    // TODO: Ajouter l'utilisateur à req.user
    // TODO: Appeler next() ou renvoyer une erreur 401
    
    // Placeholder pour le développement
    res.status(401).json({ 
      success: false, 
      message: 'Middleware d\'authentification à implémenter' 
    });
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Token invalide' 
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
    // TODO: Même logique que authenticate mais sans erreur si pas de token
    // TODO: Si token valide, ajouter l'utilisateur à req.user
    // TODO: Toujours appeler next()
    
    next();
  } catch (error) {
    // On continue même en cas d'erreur
    next();
  }
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth,
}; 