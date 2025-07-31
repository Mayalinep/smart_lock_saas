const express = require('express');
const AuthController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

/**
 * Routes d'authentification
 */

// Inscription
router.post('/register', AuthController.register);

// Connexion
router.post('/login', AuthController.login);

// Déconnexion
router.post('/logout', AuthController.logout);

// Profil utilisateur (nécessite authentification)
router.get('/me', authenticate, AuthController.getProfile);

// Mise à jour du profil (nécessite authentification)
router.put('/profile', authenticate, AuthController.updateProfile);

// Changement de mot de passe (nécessite authentification)
router.put('/password', authenticate, AuthController.changePassword);

module.exports = router; 