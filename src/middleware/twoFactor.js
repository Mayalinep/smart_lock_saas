const TwoFactorService = require('../services/twoFactorService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Middleware pour vérifier la 2FA sur les actions sensibles
 */
const requireTwoFactor = (action) => {
  return async (req, res, next) => {
    try {
      // Vérifie si l'utilisateur est authentifié
      if (!req.user) {
        return res.status(401).json({
          error: 'Non autorisé',
          message: 'Token d\'authentification requis'
        });
      }

      // Vérifie si la 2FA est requise pour cette action
      if (!TwoFactorService.isTwoFactorRequired(action)) {
        return next();
      }

      // Récupère l'utilisateur avec ses informations 2FA
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          email: true,
          twoFactorEnabled: true,
          twoFactorSecret: true,
          backupCodes: true
        }
      });

      if (!user) {
        return res.status(404).json({
          error: 'Utilisateur non trouvé',
          message: 'Utilisateur introuvable'
        });
      }

      // Si la 2FA n'est pas activée, on l'exige
      if (!user.twoFactorEnabled) {
        return res.status(403).json({
          error: '2FA requise',
          message: 'L\'authentification à deux facteurs est requise pour cette action',
          code: 'TWO_FACTOR_REQUIRED',
          action: action
        });
      }

      // Vérifie le token 2FA dans le header
      const twoFactorToken = req.headers['x-2fa-token'];
      const backupCode = req.headers['x-backup-code'];

      if (!twoFactorToken && !backupCode) {
        return res.status(403).json({
          error: 'Token 2FA manquant',
          message: 'Token d\'authentification à deux facteurs requis',
          code: 'TWO_FACTOR_TOKEN_MISSING'
        });
      }

      let isValid = false;

      // Vérifie le token TOTP
      if (twoFactorToken) {
        isValid = TwoFactorService.verifyToken(user.twoFactorSecret, twoFactorToken);
      }

      // Vérifie le code de sauvegarde
      if (!isValid && backupCode) {
        const result = TwoFactorService.verifyBackupCode(user.backupCodes, backupCode);
        isValid = result.isValid;
        
        if (isValid) {
          // Met à jour les codes de sauvegarde restants
          await prisma.user.update({
            where: { id: user.id },
            data: { backupCodes: JSON.stringify(result.remainingCodes) }
          });
        }
      }

      if (!isValid) {
        return res.status(403).json({
          error: 'Token 2FA invalide',
          message: 'Le token d\'authentification à deux facteurs est invalide',
          code: 'TWO_FACTOR_TOKEN_INVALID'
        });
      }

      // Ajoute l'action validée au request
      req.twoFactorValidated = true;
      req.twoFactorAction = action;
      
      next();
    } catch (error) {
      console.error('Erreur middleware 2FA:', error);
      return res.status(500).json({
        error: 'Erreur interne',
        message: 'Erreur lors de la vérification 2FA'
      });
    }
  };
};

/**
 * Middleware pour vérifier si la 2FA est activée (sans l'exiger)
 */
const checkTwoFactorStatus = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Non autorisé',
        message: 'Token d\'authentification requis'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        twoFactorEnabled: true
      }
    });

    req.user.twoFactorEnabled = user?.twoFactorEnabled || false;
    next();
  } catch (error) {
    console.error('Erreur vérification statut 2FA:', error);
    next();
  }
};

module.exports = {
  requireTwoFactor,
  checkTwoFactorStatus
}; 