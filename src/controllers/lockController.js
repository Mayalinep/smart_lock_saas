// src/controllers/lockController.js

const AccessService = require('../services/accessService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
   * Récupère l'historique des événements de serrure pour une propriété
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  static async getLockEvents(req, res) {
    try {
      const { propertyId } = req.params;
      const { userId } = req.user;
      const { type, limit = 50 } = req.query;

      // Vérifier que l'utilisateur est propriétaire de la propriété
      const property = await prisma.property.findUnique({
        where: { id: propertyId }
      });

      if (!property || property.ownerId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Accès non autorisé à cette propriété'
        });
      }

      // Construire la requête avec filtrage optionnel par type
      const whereClause = { propertyId };
      if (type) {
        whereClause.type = type;
      }

      // Récupérer les événements
      const events = await prisma.lockEvent.findMany({
        where: whereClause,
        orderBy: { timestamp: 'desc' },
        take: parseInt(limit),
        select: {
          id: true,
          type: true,
          timestamp: true,
          details: true
        }
      });

      res.status(200).json({
        success: true,
        message: 'Historique des événements récupéré avec succès',
        data: {
          propertyId,
          events,
          total: events.length,
          filteredBy: type || 'tous'
        }
      });

    } catch (error) {
      console.error('❌ Erreur lors de la récupération des événements:', error);
      
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de l\'historique des événements',
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