const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Validation de la configuration JWT
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required but not set. Please set JWT_SECRET in your environment variables.');
}

/**
 * Génère un token JWT pour un utilisateur
 * @param {Object} payload - Données à inclure dans le token
 * @returns {string} Token JWT
 */
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Vérifie et décode un token JWT
 * @param {string} token - Token à vérifier
 * @returns {Object} Payload décodé
 */
const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

/**
 * Génère les options pour les cookies sécurisés
 * @returns {Object} Options pour les cookies
 */
const getCookieOptions = () => {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours en millisecondes
  };
};

module.exports = {
  generateToken,
  verifyToken,
  getCookieOptions,
}; 