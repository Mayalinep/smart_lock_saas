const { z } = require('zod');

/**
 * Schéma de validation pour l'activation 2FA
 */
const twoFactorEnableSchema = z.object({
  secret: z.string().min(16, 'Le secret doit contenir au moins 16 caractères'),
  token: z.string().length(6, 'Le token doit contenir exactement 6 chiffres').regex(/^\d{6}$/, 'Le token doit contenir uniquement des chiffres')
});

/**
 * Schéma de validation pour la désactivation 2FA
 */
const twoFactorDisableSchema = z.object({
  token: z.string().length(6, 'Le token doit contenir exactement 6 chiffres').regex(/^\d{6}$/, 'Le token doit contenir uniquement des chiffres')
});

/**
 * Schéma de validation pour la régénération des codes de sauvegarde
 */
const regenerateBackupCodesSchema = z.object({
  token: z.string().length(6, 'Le token doit contenir exactement 6 chiffres').regex(/^\d{6}$/, 'Le token doit contenir uniquement des chiffres')
});

/**
 * Middleware de validation pour l'activation 2FA
 */
const validateTwoFactorEnable = (req, res, next) => {
  try {
    const validatedData = twoFactorEnableSchema.parse(req.body);
    req.body = validatedData;
    next();
  } catch (error) {
    return res.status(400).json({
      error: 'Erreur de validation',
      message: 'Données invalides',
      details: error.errors
    });
  }
};

/**
 * Middleware de validation pour la désactivation 2FA
 */
const validateTwoFactorDisable = (req, res, next) => {
  try {
    const validatedData = twoFactorDisableSchema.parse(req.body);
    req.body = validatedData;
    next();
  } catch (error) {
    return res.status(400).json({
      error: 'Erreur de validation',
      message: 'Données invalides',
      details: error.errors
    });
  }
};

/**
 * Middleware de validation pour la régénération des codes de sauvegarde
 */
const validateRegenerateBackupCodes = (req, res, next) => {
  try {
    const validatedData = regenerateBackupCodesSchema.parse(req.body);
    req.body = validatedData;
    next();
  } catch (error) {
    return res.status(400).json({
      error: 'Erreur de validation',
      message: 'Données invalides',
      details: error.errors
    });
  }
};

module.exports = {
  validateTwoFactorEnable,
  validateTwoFactorDisable,
  validateRegenerateBackupCodes,
  twoFactorEnableSchema,
  twoFactorDisableSchema,
  regenerateBackupCodesSchema
}; 