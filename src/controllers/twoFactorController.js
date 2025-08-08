const TwoFactorService = require('../services/twoFactorService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class TwoFactorController {
  /**
   * Initialise la 2FA pour un utilisateur
   * POST /api/2fa/setup
   */
  static async setup(req, res) {
    try {
      const userId = req.user.id;

      // Vérifie si la 2FA est déjà activée
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { twoFactorEnabled: true }
      });

      if (existingUser?.twoFactorEnabled) {
        return res.status(400).json({
          error: '2FA déjà activée',
          message: 'L\'authentification à deux facteurs est déjà activée'
        });
      }

      // Récupère les informations utilisateur
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, firstName: true, lastName: true }
      });

      // Génère le secret TOTP
      const { secret, otpauthUrl } = TwoFactorService.generateSecret(user);

      // Génère le QR code
      const qrCodeDataUrl = await TwoFactorService.generateQRCode(otpauthUrl);

      res.json({
        message: 'Configuration 2FA initialisée',
        data: {
          secret: secret,
          qrCode: qrCodeDataUrl,
          otpauthUrl: otpauthUrl
        }
      });
    } catch (error) {
      console.error('Erreur setup 2FA:', error);
      res.status(500).json({
        error: 'Erreur interne',
        message: 'Erreur lors de l\'initialisation de la 2FA'
      });
    }
  }

  /**
   * Active la 2FA pour un utilisateur
   * POST /api/2fa/enable
   */
  static async enable(req, res) {
    try {
      const { secret, token } = req.body;
      const userId = req.user.id;

      if (!secret || !token) {
        return res.status(400).json({
          error: 'Données manquantes',
          message: 'Secret et token requis'
        });
      }

      // Vérifie le token pour confirmer la configuration
      const isValid = TwoFactorService.verifyToken(secret, token);
      if (!isValid) {
        return res.status(400).json({
          error: 'Token invalide',
          message: 'Le token de vérification est incorrect'
        });
      }

      // Récupère l'utilisateur
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      // Active la 2FA
      const { backupCodes, encryptedSecret, encryptedBackupCodes } = 
        await TwoFactorService.enableTwoFactor(user, secret);

      // Met à jour l'utilisateur en base
      await prisma.user.update({
        where: { id: userId },
        data: {
          twoFactorEnabled: true,
          twoFactorSecret: encryptedSecret,
          backupCodes: encryptedBackupCodes
        }
      });

      res.json({
        message: '2FA activée avec succès',
        data: {
          backupCodes: backupCodes,
          message: 'Conservez ces codes de sauvegarde en lieu sûr'
        }
      });
    } catch (error) {
      console.error('Erreur activation 2FA:', error);
      res.status(500).json({
        error: 'Erreur interne',
        message: 'Erreur lors de l\'activation de la 2FA'
      });
    }
  }

  /**
   * Désactive la 2FA pour un utilisateur
   * POST /api/2fa/disable
   */
  static async disable(req, res) {
    try {
      const { token } = req.body;
      const userId = req.user.id;

      if (!token) {
        return res.status(400).json({
          error: 'Token manquant',
          message: 'Token de confirmation requis'
        });
      }

      // Récupère l'utilisateur avec son secret 2FA
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { twoFactorSecret: true }
      });

      if (!user?.twoFactorSecret) {
        return res.status(400).json({
          error: '2FA non activée',
          message: 'L\'authentification à deux facteurs n\'est pas activée'
        });
      }

      // Vérifie le token
      const isValid = TwoFactorService.verifyToken(user.twoFactorSecret, token);
      if (!isValid) {
        return res.status(400).json({
          error: 'Token invalide',
          message: 'Le token de confirmation est incorrect'
        });
      }

      // Désactive la 2FA
      await prisma.user.update({
        where: { id: userId },
        data: {
          twoFactorEnabled: false,
          twoFactorSecret: null,
          backupCodes: null
        }
      });

      res.json({
        message: '2FA désactivée avec succès'
      });
    } catch (error) {
      console.error('Erreur désactivation 2FA:', error);
      res.status(500).json({
        error: 'Erreur interne',
        message: 'Erreur lors de la désactivation de la 2FA'
      });
    }
  }

  /**
   * Vérifie le statut 2FA d'un utilisateur
   * GET /api/2fa/status
   */
  static async getStatus(req, res) {
    try {
      const userId = req.user.id;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          twoFactorEnabled: true,
          backupCodes: true
        }
      });

      if (!user) {
        return res.status(404).json({
          error: 'Utilisateur non trouvé'
        });
      }

      // Compte les codes de sauvegarde restants
      let remainingBackupCodes = 0;
      if (user.backupCodes) {
        try {
          const codes = JSON.parse(user.backupCodes);
          remainingBackupCodes = codes.length;
        } catch (e) {
          remainingBackupCodes = 0;
        }
      }

      res.json({
        data: {
          enabled: user.twoFactorEnabled,
          remainingBackupCodes: remainingBackupCodes
        }
      });
    } catch (error) {
      console.error('Erreur statut 2FA:', error);
      res.status(500).json({
        error: 'Erreur interne',
        message: 'Erreur lors de la récupération du statut 2FA'
      });
    }
  }

  /**
   * Régénère les codes de sauvegarde
   * POST /api/2fa/backup-codes
   */
  static async regenerateBackupCodes(req, res) {
    try {
      const { token } = req.body;
      const userId = req.user.id;

      if (!token) {
        return res.status(400).json({
          error: 'Token manquant',
          message: 'Token de confirmation requis'
        });
      }

      // Récupère l'utilisateur
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { twoFactorSecret: true, twoFactorEnabled: true }
      });

      if (!user?.twoFactorEnabled) {
        return res.status(400).json({
          error: '2FA non activée',
          message: 'L\'authentification à deux facteurs n\'est pas activée'
        });
      }

      // Vérifie le token
      const isValid = TwoFactorService.verifyToken(user.twoFactorSecret, token);
      if (!isValid) {
        return res.status(400).json({
          error: 'Token invalide',
          message: 'Le token de confirmation est incorrect'
        });
      }

      // Génère de nouveaux codes de sauvegarde
      const backupCodes = TwoFactorService.generateBackupCodes();
      const encryptedBackupCodes = JSON.stringify(backupCodes);

      // Met à jour l'utilisateur
      await prisma.user.update({
        where: { id: userId },
        data: { backupCodes: encryptedBackupCodes }
      });

      res.json({
        message: 'Codes de sauvegarde régénérés',
        data: {
          backupCodes: backupCodes,
          message: 'Conservez ces nouveaux codes de sauvegarde en lieu sûr'
        }
      });
    } catch (error) {
      console.error('Erreur régénération codes:', error);
      res.status(500).json({
        error: 'Erreur interne',
        message: 'Erreur lors de la régénération des codes de sauvegarde'
      });
    }
  }
}

module.exports = TwoFactorController; 