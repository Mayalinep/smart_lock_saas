const { AuthService, registerUser, loginUser } = require('../services/authService');
const { getCookieOptions, generateToken } = require('../utils/jwt');

/**
 * Controller d'authentification
 */
class AuthController {
  /**
   * Inscription d'un nouvel utilisateur
   * POST /api/auth/register
   */
  static async register(req, res, next) {
    try {
      // 1. Extraire les données de req.body
      const { email, password, firstName, lastName, phone } = req.body;

      // 2. Validation basique des données requises
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({
          success: false,
          message: 'Email, mot de passe, prénom et nom sont obligatoires'
        });
      }

      // 3. Créer l'utilisateur via le service
      const newUser = await registerUser({ email, password, firstName, lastName, phone });

      // 4. Générer un JWT avec l'id de l'utilisateur
      const token = generateToken({ userId: newUser.id });

      // 5. Configurer les options du cookie sécurisé
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // true en production
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours en millisecondes
      };

      // 6. Stocker le token dans un cookie
      res.cookie('token', token, cookieOptions);

      // 7. Retourner la réponse avec les infos publiques de l'utilisateur
      res.status(201).json({
        success: true,
        message: 'Inscription réussie',
        data: {
          user: {
            id: newUser.id,
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            role: newUser.role
          }
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Connexion d'un utilisateur
   * POST /api/auth/login
   */
  static async login(req, res, next) {
    try {
      // 1. Extraire email et password depuis req.body
      const { email, password } = req.body;

      // 2. Validation basique des données requises
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email et mot de passe sont obligatoires'
        });
      }

      // 3. Appeler loginUser depuis authService
      const { user, token } = await loginUser(email, password);

      // 4. Stocker le token dans un cookie sécurisé
      res.cookie('token', token, getCookieOptions());

      // 5. Répondre avec les informations de l'utilisateur
      res.status(200).json({
        success: true,
        message: "Connexion réussie",
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
          }
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Récupération du profil utilisateur connecté
   * GET /api/auth/me
   */
  static async getProfile(req, res, next) {
    try {
      // TODO: Récupérer l'ID utilisateur depuis req.user
      // TODO: Appeler AuthService.getProfile
      // TODO: Retourner le profil

      res.status(200).json({
        success: true,
        message: 'Controller getProfile à implémenter',
        data: null
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mise à jour du profil utilisateur
   * PUT /api/auth/profile
   */
  static async updateProfile(req, res, next) {
    try {
      // TODO: Récupérer l'ID utilisateur depuis req.user
      // TODO: Extraire les données de mise à jour
      // TODO: Appeler AuthService.updateProfile
      // TODO: Retourner le profil mis à jour

      res.status(200).json({
        success: true,
        message: 'Controller updateProfile à implémenter',
        data: null
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Changement de mot de passe
   * PUT /api/auth/password
   */
  static async changePassword(req, res, next) {
    try {
      // TODO: Récupérer l'ID utilisateur depuis req.user
      // TODO: Extraire currentPassword et newPassword
      // TODO: Appeler AuthService.changePassword
      // TODO: Retourner un message de succès

      res.status(200).json({
        success: true,
        message: 'Controller changePassword à implémenter'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Déconnexion de l'utilisateur
   * POST /api/auth/logout
   */
  static async logout(req, res, next) {
    try {
      // TODO: Effacer le cookie JWT
      // TODO: Optionnel: Blacklister le token côté serveur
      // TODO: Retourner un message de succès

      res.clearCookie('token');
      res.status(200).json({
        success: true,
        message: 'Déconnexion réussie'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController; 