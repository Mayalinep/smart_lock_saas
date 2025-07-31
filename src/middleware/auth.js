const { verifyToken } = require('../utils/jwt');
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

    // 3. Utiliser verifyToken pour décoder le token
    const decoded = verifyToken(token);

    // 4. Si verifyToken ne lance pas d'erreur, le token est valide
    // 5. Attacher l'objet { userId: ... } à req.user
    req.user = { userId: decoded.userId };

    // 6. Appeler next() si tout est OK
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