// src/controllers/lockController.js

const AccessService = require('../services/accessService');

/**
 * Contrôleur de gestion des serrures
 */
class LockController {
  /**
   * Récupère le statut d'une serrure pour une propriété
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  static async getLockStatus(req, res) {
    try {
      const { propertyId } = req.params;
      const { userId } = req.user;

      // Récupérer le statut de la serrure avec vérification des droits
      const lockStatus = await AccessService.getLockStatus(propertyId, userId);

      res.status(200).json({
        success: true,
        message: 'Statut de la serrure récupéré avec succès',
        data: {
          lockStatus
        }
      });

    } catch (error) {
      console.error('❌ Erreur lors de la récupération du statut de serrure:', error);
      
      // Gérer les erreurs d'autorisation
      if (error.message === 'Accès non autorisé à cette propriété') {
        return res.status(403).json({
          success: false,
          message: 'Accès non autorisé à cette propriété',
          error: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du statut de la serrure',
        error: error.message
      });
    }
  }

  /**
   * Force la synchronisation d'une serrure (reprogrammation de tous les codes actifs)
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  static async syncLock(req, res) {
    try {
      const { propertyId } = req.params;
      const { userId } = req.user;

      // TODO: Récupérer tous les accès actifs pour cette propriété
      // TODO: Reprogrammer chaque code sur la serrure
      // TODO: Retourner le résultat de la synchronisation

      res.status(200).json({
        success: true,
        message: 'Synchronisation de la serrure lancée',
        data: {
          propertyId,
          syncStartedAt: new Date()
        }
      });

    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation de la serrure:', error);
      
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la synchronisation de la serrure',
        error: error.message
      });
    }
  }
}

module.exports = LockController; 