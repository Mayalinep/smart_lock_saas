const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');
const encryptionService = require('./encryptionService');

class TwoFactorService {
  /**
   * Génère un secret TOTP pour un utilisateur
   */
  static generateSecret(user) {
    const secret = speakeasy.generateSecret({
      name: `Smart Lock SaaS (${user.email})`,
      issuer: 'Smart Lock SaaS',
      length: 32
    });
    
    return {
      secret: secret.base32,
      otpauthUrl: secret.otpauth_url
    };
  }

  /**
   * Génère un QR code pour l'application d'authentification
   */
  static async generateQRCode(otpauthUrl) {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);
      return qrCodeDataUrl;
    } catch (error) {
      throw new Error('Erreur lors de la génération du QR code');
    }
  }

  /**
   * Génère des codes de sauvegarde
   */
  static generateBackupCodes() {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      // Génère un code de 8 caractères alphanumériques
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  /**
   * Vérifie un token TOTP
   */
  static verifyToken(encryptedSecret, token) {
    try {
      // Déchiffrer le secret TOTP
      const secret = encryptionService.decrypt(encryptedSecret);
      
      return speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token,
        window: 2 // Accepte les tokens dans une fenêtre de ±2 périodes (60s)
      });
    } catch (error) {
      console.error('❌ Erreur lors de la vérification du token TOTP:', error);
      return false;
    }
  }

  /**
   * Vérifie un code de sauvegarde
   */
  static verifyBackupCode(encryptedBackupCodes, code) {
    try {
      // Déchiffrer les codes de sauvegarde
      const codes = encryptionService.decryptObject(encryptedBackupCodes);
      const index = codes.indexOf(code);
      
      if (index !== -1) {
        // Supprime le code utilisé
        codes.splice(index, 1);
        return {
          isValid: true,
          remainingCodes: codes,
          encryptedRemainingCodes: encryptionService.encryptObject(codes)
        };
      }
      
      return {
        isValid: false,
        remainingCodes: codes,
        encryptedRemainingCodes: encryptionService.encryptObject(codes)
      };
    } catch (error) {
      console.error('❌ Erreur lors de la vérification du code de sauvegarde:', error);
      return {
        isValid: false,
        remainingCodes: [],
        encryptedRemainingCodes: encryptionService.encryptObject([])
      };
    }
  }

  /**
   * Active la 2FA pour un utilisateur
   */
  static async enableTwoFactor(user, secret) {
    const backupCodes = this.generateBackupCodes();
    
    // Chiffrer les secrets sensibles
    const encryptedSecret = encryptionService.encrypt(secret);
    const encryptedBackupCodes = encryptionService.encryptObject(backupCodes);
    
    return {
      backupCodes: backupCodes, // Codes en clair pour l'affichage initial
      encryptedSecret: encryptedSecret,
      encryptedBackupCodes: encryptedBackupCodes
    };
  }

  /**
   * Désactive la 2FA pour un utilisateur
   */
  static disableTwoFactor() {
    return {
      twoFactorEnabled: false,
      twoFactorSecret: null,
      backupCodes: null
    };
  }

  /**
   * Vérifie si la 2FA est requise pour une action
   */
  static isTwoFactorRequired(action) {
    const sensitiveActions = [
      'DELETE_PROPERTY',
      'REVOKE_ACCESS',
      'CHANGE_PASSWORD',
      'UPDATE_BILLING',
      'ADMIN_ACTION'
    ];
    
    return sensitiveActions.includes(action);
  }
}

module.exports = TwoFactorService; 