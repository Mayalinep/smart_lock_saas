const { AuthService, registerUser, loginUser } = require('../services/authService');
const { getCookieOptions, generateToken } = require('../utils/jwt');
const jwt = require('jsonwebtoken');
const { add: addToBlacklist } = require('../services/tokenBlacklist');
const { notifyWelcome } = require('../services/notificationService');

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
      // ✅ Validation déjà faite par Zod middleware !
      const { email, password, firstName, lastName, phone } = req.body;

      // 2. Créer l'utilisateur via le service
      const newUser = await registerUser({ email, password, firstName, lastName, phone });

      // 3. Envoyer l'email de bienvenue (en arrière-plan)
      notifyWelcome(newUser).catch(error => {
        console.error('❌ Erreur lors de l\'envoi de l\'email de bienvenue:', error);
      });

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
      // ✅ Validation déjà faite par Zod middleware !
      const { email, password } = req.body;

      // 2. Appeler loginUser depuis authService
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
      // 1. Récupérer l'ID utilisateur depuis req.user (fourni par le middleware authenticate)
      const userId = req.user.userId;

      // 2. Récupérer l'utilisateur en base (sans le mot de passe)
      const prisma = require('../config/database');
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
        }
      });

      // 3. Vérifier que l'utilisateur existe encore
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
      }

      // 4. Retourner le profil
      res.status(200).json({
        success: true,
        message: 'Profil récupéré avec succès',
        data: { user }
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
      // 1. Récupérer le token courant s'il existe
      const token = req.cookies.token;

      // 2. Supprimer le cookie token avec les options appropriées pour suppression
      res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/' // Important : même path que lors de la création
      });

      // 3. Si on a un token, l'ajouter à la blacklist jusqu'à son expiration
      if (token) {
        try {
          const decoded = jwt.decode(token);
          // ttl = temps restant jusqu'à expiration, borné à 30 jours max dans le service
          if (decoded && decoded.exp) {
            const nowSec = Math.floor(Date.now() / 1000);
            const ttl = Math.max(0, decoded.exp - nowSec);
            if (ttl > 0) {
              await addToBlacklist(token, ttl);
            } else {
              // Déjà expiré, rien à faire
            }
          }
        } catch (_) {
          // ignore erreurs de decode
        }
      }

      // 4. Retourner un message de succès  
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