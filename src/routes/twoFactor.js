const express = require('express');
const router = express.Router();
const TwoFactorController = require('../controllers/twoFactorController');
const { authenticate } = require('../middleware/auth');
const { requireTwoFactor } = require('../middleware/twoFactor');
const { validateTwoFactorSetup, validateTwoFactorEnable, validateTwoFactorDisable } = require('../validators/twoFactorSchemas');

/**
 * @swagger
 * /api/2fa/setup:
 *   post:
 *     summary: Initialise la configuration 2FA
 *     tags: [2FA]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Configuration 2FA initialisée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     secret:
 *                       type: string
 *                     qrCode:
 *                       type: string
 *                     otpauthUrl:
 *                       type: string
 */
router.post('/setup', authenticate, TwoFactorController.setup);

/**
 * @swagger
 * /api/2fa/enable:
 *   post:
 *     summary: Active la 2FA
 *     tags: [2FA]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - secret
 *               - token
 *             properties:
 *               secret:
 *                 type: string
 *                 description: Secret TOTP généré
 *               token:
 *                 type: string
 *                 description: Token de vérification
 *     responses:
 *       200:
 *         description: 2FA activée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     backupCodes:
 *                       type: array
 *                       items:
 *                         type: string
 */
router.post('/enable', authenticate, validateTwoFactorEnable, TwoFactorController.enable);

/**
 * @swagger
 * /api/2fa/disable:
 *   post:
 *     summary: Désactive la 2FA
 *     tags: [2FA]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token de confirmation
 *     responses:
 *       200:
 *         description: 2FA désactivée avec succès
 */
router.post('/disable', authenticate, requireTwoFactor('CHANGE_PASSWORD'), validateTwoFactorDisable, TwoFactorController.disable);

/**
 * @swagger
 * /api/2fa/status:
 *   get:
 *     summary: Récupère le statut 2FA
 *     tags: [2FA]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statut 2FA récupéré
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     enabled:
 *                       type: boolean
 *                     remainingBackupCodes:
 *                       type: number
 */
router.get('/status', authenticate, TwoFactorController.getStatus);

/**
 * @swagger
 * /api/2fa/backup-codes:
 *   post:
 *     summary: Régénère les codes de sauvegarde
 *     tags: [2FA]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token de confirmation
 *     responses:
 *       200:
 *         description: Codes de sauvegarde régénérés
 */
router.post('/backup-codes', authenticate, requireTwoFactor('CHANGE_PASSWORD'), TwoFactorController.regenerateBackupCodes);

module.exports = router; 