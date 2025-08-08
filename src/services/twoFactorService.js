const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');

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
  static verifyToken(secret, token) {
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 2 // Accepte les tokens dans une fenêtre de ±2 périodes (60s)
    });
  }

  /**
   * Vérifie un code de sauvegarde
   */
  static verifyBackupCode(backupCodes, code) {
    const codes = JSON.parse(backupCodes);
    const index = codes.indexOf(code);
    
    if (index !== -1) {
      // Supprime le code utilisé
      codes.splice(index, 1);
      return {
        isValid: true,
        remainingCodes: codes
      };
    }
    
    return {
      isValid: false,
      remainingCodes: codes
    };
  }

  /**
   * Active la 2FA pour un utilisateur
   */
  static async enableTwoFactor(user, secret) {
    const backupCodes = this.generateBackupCodes();
    
    // En production, on chiffrerait ces données
    const encryptedSecret = secret; // TODO: Chiffrer avec une clé maître
    const encryptedBackupCodes = JSON.stringify(backupCodes); // TODO: Chiffrer
    
    return {
      backupCodes: backupCodes,
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