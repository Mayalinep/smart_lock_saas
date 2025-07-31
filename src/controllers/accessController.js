const AccessService = require('../services/accessService');

/**
 * Controller de gestion des accès
 */
class AccessController {
  /**
   * Création d'un nouvel accès pour une propriété
   * POST /api/access
   */
  static async createAccess(req, res, next) {
    try {
      // Récupérer l'ID utilisateur depuis req.user (propriétaire)
      const ownerId = req.user.userId;

      // Extraire les données d'accès depuis req.body
      const { propertyId, userId, startDate, endDate, accessType, description } = req.body;

      // Valider les données requises
      if (!propertyId || !userId || !startDate || !endDate || !accessType) {
        return res.status(400).json({
          success: false,
          message: 'Données manquantes: propertyId, userId, startDate, endDate et accessType sont requis'
        });
      }

      // Préparer les données d'accès
      const accessData = {
        userId,
        startDate,
        endDate,
        accessType,
        description
      };

      // Appeler AccessService.createAccess
      const newAccess = await AccessService.createAccess(propertyId, ownerId, accessData);

      // Retourner l'accès créé
      res.status(201).json({
        success: true,
        message: 'Accès créé avec succès',
        data: { access: newAccess }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Récupération des accès pour une propriété
   * GET /api/access/property/:propertyId
   */
  static async getPropertyAccesses(req, res, next) {
    try {
      // Récupérer l'ID de la propriété depuis req.params
      const propertyId = req.params.propertyId;
      
      // Récupérer l'ID utilisateur depuis req.user (propriétaire)
      const ownerId = req.user.userId;

      // Appeler AccessService.getPropertyAccesses
      const accesses = await AccessService.getPropertyAccesses(propertyId, ownerId);

      // Retourner la liste des accès
      res.status(200).json({
        success: true,
        message: `${accesses.length} accès trouvé(s) pour cette propriété`,
        data: { accesses }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Récupération des accès de l'utilisateur connecté
   * GET /api/access/my-accesses
   */
  static async getUserAccesses(req, res, next) {
    try {
      // Récupérer l'ID utilisateur depuis req.user
      const userId = req.user.userId;

      // Appeler AccessService.getUserAccesses
      const accesses = await AccessService.getUserAccesses(userId);

      // Retourner la liste des accès de l'utilisateur
      res.status(200).json({
        success: true,
        message: `${accesses.length} accès actif(s) trouvé(s)`,
        data: { accesses }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Récupération de l'historique complet d'une propriété (y compris accès révoqués)
   * GET /api/access/property/:propertyId/history
   */
  static async getPropertyAccessHistory(req, res, next) {
    try {
      // Récupérer l'ID de la propriété depuis req.params
      const propertyId = req.params.propertyId;
      
      // Récupérer l'ID utilisateur depuis req.user (propriétaire)
      const ownerId = req.user.userId;

      // Appeler AccessService.getPropertyAccessHistory
      const history = await AccessService.getPropertyAccessHistory(propertyId, ownerId);

      // Statistiques pour le résumé
      const stats = {
        total: history.length,
        active: history.filter(a => a.status === 'ACTIF').length,
        revoked: history.filter(a => a.status === 'RÉVOQUÉ').length,
        inactive: history.filter(a => a.status === 'INACTIF').length
      };

      // Retourner l'historique complet
      res.status(200).json({
        success: true,
        message: `Historique complet: ${stats.total} accès (${stats.active} actifs, ${stats.revoked} révoqués)`,
        data: { 
          history,
          statistics: stats
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Récupération d'un accès par ID
   * GET /api/access/:id
   */
  static async getAccessById(req, res, next) {
    try {
      // TODO: Récupérer l'ID de l'accès depuis req.params
      // TODO: Récupérer l'ID utilisateur depuis req.user
      // TODO: Appeler AccessService.getAccessById
      // TODO: Retourner les détails de l'accès

      res.status(200).json({
        success: true,
        message: 'Controller getAccessById à implémenter',
        data: null
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mise à jour d'un accès
   * PUT /api/access/:id
   */
  static async updateAccess(req, res, next) {
    try {
      // TODO: Récupérer l'ID de l'accès depuis req.params
      // TODO: Récupérer l'ID utilisateur depuis req.user
      // TODO: Extraire les données de mise à jour
      // TODO: Appeler AccessService.updateAccess
      // TODO: Retourner l'accès mis à jour

      res.status(200).json({
        success: true,
        message: 'Controller updateAccess à implémenter',
        data: null
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Révocation d'un accès (soft delete)
   * DELETE /api/access/:accessId
   */
  static async deleteAccess(req, res, next) {
    try {
      // Récupérer l'ID de l'accès depuis req.params
      const accessId = req.params.accessId;
      
      // Récupérer l'ID utilisateur depuis req.user (propriétaire)
      const ownerId = req.user.userId;

      // Appeler AccessService.deleteAccessById (soft delete)
      const result = await AccessService.deleteAccessById(accessId, ownerId);

      // Retourner le succès avec informations de traçabilité
      res.status(200).json({
        success: result.success,
        message: result.message,
        data: {
          revokedAt: result.data.revokedAt,
          revokedBy: result.data.revokedBy,
          access: {
            id: result.data.access.id,
            code: result.data.access.code,
            user: result.data.access.user,
            property: result.data.access.property
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Validation d'un code d'accès (route publique pour les serrures)
   * POST /api/access/validate
   */
  static async validateAccessCode(req, res, next) {
    try {
      // TODO: Extraire le code d'accès et l'ID de propriété
      // TODO: Appeler AccessService.validateAccessCode
      // TODO: Retourner le résultat de validation

      res.status(200).json({
        success: true,
        message: 'Controller validateAccessCode à implémenter',
        data: { valid: false }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Nettoyage des accès expirés (route admin)
   * POST /api/access/cleanup
   */
  static async cleanupExpiredAccesses(req, res, next) {
    try {
      // TODO: Appeler AccessService.cleanupExpiredAccesses
      // TODO: Retourner le nombre d'accès nettoyés

      res.status(200).json({
        success: true,
        message: 'Controller cleanupExpiredAccesses à implémenter',
        data: { cleaned: 0 }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Récupération du statut d'une serrure pour une propriété
   * GET /api/access/lock-status/:propertyId
   */
  static async getLockStatus(req, res, next) {
    try {
      const { propertyId } = req.params;
      const ownerId = req.user.userId;
      const status = await AccessService.getLockStatus(propertyId, ownerId);
      res.status(200).json({ 
        success: true,
        message: 'Statut serrure récupéré', 
        data: { lock: status } 
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AccessController; 