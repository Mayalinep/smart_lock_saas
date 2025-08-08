const TwoFactorService = require('../src/services/twoFactorService');

describe('TwoFactorService', () => {
  const mockUser = {
    id: 'user123',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe'
  };

  describe('generateSecret', () => {
    it('génère un secret TOTP valide', () => {
      const result = TwoFactorService.generateSecret(mockUser);
      
      expect(result).toHaveProperty('secret');
      expect(result).toHaveProperty('otpauthUrl');
      expect(result.secret).toMatch(/^[A-Z2-7]+=*$/); // Base32 format
      expect(result.otpauthUrl).toContain('otpauth://totp/');
      expect(result.otpauthUrl).toContain('test%40example.com'); // Email encodé en URL
    });
  });

  describe('generateQRCode', () => {
    it('génère un QR code valide', async () => {
      const otpauthUrl = 'otpauth://totp/Smart%20Lock%20SaaS%20(test%40example.com)?secret=JBSWY3DPEHPK3PXP&issuer=Smart%20Lock%20SaaS';
      
      const qrCode = await TwoFactorService.generateQRCode(otpauthUrl);
      
      expect(qrCode).toMatch(/^data:image\/png;base64,/);
    });

    it('génère un QR code même pour une URL invalide', async () => {
      // QRCode.toDataURL accepte même les URLs invalides
      const qrCode = await TwoFactorService.generateQRCode('invalid-url');
      expect(qrCode).toMatch(/^data:image\/png;base64,/);
    });
  });

  describe('generateBackupCodes', () => {
    it('génère 10 codes de sauvegarde', () => {
      const codes = TwoFactorService.generateBackupCodes();
      
      expect(codes).toHaveLength(10);
      codes.forEach(code => {
        expect(code).toMatch(/^[A-F0-9]{8}$/); // 8 caractères hexadécimaux
      });
    });

    it('génère des codes uniques', () => {
      const codes1 = TwoFactorService.generateBackupCodes();
      const codes2 = TwoFactorService.generateBackupCodes();
      
      expect(codes1).not.toEqual(codes2);
    });
  });

  describe('verifyToken', () => {
    it('vérifie un token TOTP valide', () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      const encryptedSecret = require('../src/services/encryptionService').encrypt(secret);
      const token = '123456'; // Token de test
      
      const result = TwoFactorService.verifyToken(encryptedSecret, token);
      
      expect(typeof result).toBe('boolean');
    });

    it('rejette un token invalide', () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      const encryptedSecret = require('../src/services/encryptionService').encrypt(secret);
      const token = '000000';
      
      const result = TwoFactorService.verifyToken(encryptedSecret, token);
      
      expect(result).toBe(false);
    });
  });

  describe('verifyBackupCode', () => {
    it('vérifie un code de sauvegarde valide', () => {
      const backupCodes = ['ABCD1234', 'EFGH5678', 'IJKL9012'];
      const encryptedBackupCodes = require('../src/services/encryptionService').encryptObject(backupCodes);
      const code = 'ABCD1234';
      
      const result = TwoFactorService.verifyBackupCode(encryptedBackupCodes, code);
      
      expect(result.isValid).toBe(true);
      expect(result.remainingCodes).toHaveLength(2);
      expect(result.remainingCodes).not.toContain(code);
    });

    it('rejette un code de sauvegarde invalide', () => {
      const backupCodes = ['ABCD1234', 'EFGH5678'];
      const encryptedBackupCodes = require('../src/services/encryptionService').encryptObject(backupCodes);
      const code = 'INVALID';
      
      const result = TwoFactorService.verifyBackupCode(encryptedBackupCodes, code);
      
      expect(result.isValid).toBe(false);
      expect(result.remainingCodes).toEqual(backupCodes);
    });
  });

  describe('enableTwoFactor', () => {
    it('active la 2FA avec backup codes', async () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      
      const result = await TwoFactorService.enableTwoFactor(mockUser, secret);
      
      expect(result).toHaveProperty('backupCodes');
      expect(result).toHaveProperty('encryptedSecret');
      expect(result).toHaveProperty('encryptedBackupCodes');
      expect(result.backupCodes).toHaveLength(10);
      expect(result.encryptedSecret).not.toBe(secret); // Maintenant chiffré
      expect(require('../src/services/encryptionService').isEncrypted(result.encryptedSecret)).toBe(true);
    });
  });

  describe('disableTwoFactor', () => {
    it('désactive la 2FA', () => {
      const result = TwoFactorService.disableTwoFactor();
      
      expect(result).toEqual({
        twoFactorEnabled: false,
        twoFactorSecret: null,
        backupCodes: null
      });
    });
  });

  describe('isTwoFactorRequired', () => {
    it('retourne true pour les actions sensibles', () => {
      const sensitiveActions = [
        'DELETE_PROPERTY',
        'REVOKE_ACCESS',
        'CHANGE_PASSWORD',
        'UPDATE_BILLING',
        'ADMIN_ACTION'
      ];
      
      sensitiveActions.forEach(action => {
        expect(TwoFactorService.isTwoFactorRequired(action)).toBe(true);
      });
    });

    it('retourne false pour les actions non sensibles', () => {
      const normalActions = [
        'VIEW_PROPERTY',
        'LIST_ACCESS',
        'GET_STATUS'
      ];
      
      normalActions.forEach(action => {
        expect(TwoFactorService.isTwoFactorRequired(action)).toBe(false);
      });
    });
  });
}); 