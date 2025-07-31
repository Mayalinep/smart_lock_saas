const { PropertyService, createProperty, getUserProperties, getPropertyById, updateProperty, deleteProperty, togglePropertyStatus } = require('../services/propertyService');

/**
 * Controller de gestion des propriétés
 */
class PropertyController {
  /**
   * Création d'une nouvelle propriété
   * POST /api/properties
   */
  static async createProperty(req, res, next) {
    try {
      // 1. Récupérer l'ID utilisateur depuis req.user (fourni par le middleware authenticate)
      const userId = req.user.userId;

      // 2. Extraire les données de la propriété depuis req.body
      const propertyData = req.body;

      // 3. Appeler createProperty depuis le service
      const property = await createProperty(propertyData, userId);

      // 4. Retourner la propriété créée
      res.status(201).json({
        success: true,
        message: "Propriété créée avec succès",
        data: { property }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Récupération des propriétés de l'utilisateur connecté
   * GET /api/properties
   */
  static async getUserProperties(req, res, next) {
    try {
      // 1. Extraire userId depuis req.user.userId (fourni par le middleware authenticate)
      const userId = req.user.userId;

      // 2. Appeler getUserProperties depuis le service
      const properties = await getUserProperties(userId);

      // 3. Répondre avec la liste des propriétés
      res.status(200).json({
        success: true,
        message: "Liste des propriétés récupérée",
        data: { properties }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Récupération d'une propriété par ID
   * GET /api/properties/:id
   */
  static async getPropertyById(req, res, next) {
    try {
      // 1. Lire req.params.id et req.user.userId
      const id = req.params.id;
      const userId = req.user.userId;

      // 2. Appeler getPropertyById(id, userId)
      const property = await getPropertyById(id, userId);

      // 3. Si pas trouvée → 404
      if (!property) {
        return res.status(404).json({ 
          success: false, 
          message: "Propriété non trouvée" 
        });
      }

      // 4. Sinon, retourner la propriété
      res.status(200).json({
        success: true,
        message: "Propriété trouvée",
        data: { property }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mise à jour d'une propriété
   * PUT /api/properties/:id
   */
  static async updateProperty(req, res, next) {
    try {
      // 1. Récupérer l'ID de la propriété depuis req.params
      const id = req.params.id;
      
      // 2. Récupérer l'ID utilisateur depuis req.user
      const userId = req.user.userId;

      // 3. Extraire les données de mise à jour depuis req.body
      const updateData = req.body;

      // 4. Appeler updateProperty depuis le service
      const updatedProperty = await updateProperty(id, userId, updateData);

      // 5. Si pas trouvée → 404
      if (!updatedProperty) {
        return res.status(404).json({ 
          success: false, 
          message: "Propriété non trouvée" 
        });
      }

      // 6. Retourner la propriété mise à jour
      res.status(200).json({
        success: true,
        message: "Propriété mise à jour avec succès",
        data: { property: updatedProperty }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Suppression d'une propriété
   * DELETE /api/properties/:id
   */
  static async deleteProperty(req, res, next) {
    try {
      // TODO: Récupérer l'ID de la propriété depuis req.params
      // TODO: Récupérer l'ID utilisateur depuis req.user
      // TODO: Appeler PropertyService.deleteProperty
      // TODO: Retourner un message de succès

      res.status(200).json({
        success: true,
        message: 'Controller deleteProperty à implémenter'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Suppression d'une propriété
   * DELETE /api/properties/:id
   */
  static async deleteProperty(req, res, next) {
    try {
      const id = req.params.id;
      const userId = req.user.userId;

      const result = await deleteProperty(id, userId);
      
      if (!result) {
        return res.status(404).json({
          success: false,
          message: "Propriété non trouvée"
        });
      }

      res.status(200).json({
        success: true,
        message: "Propriété supprimée avec succès"
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Activation/Désactivation d'une propriété
   * PATCH /api/properties/:id/status
   */
  static async togglePropertyStatus(req, res, next) {
    try {
      const id = req.params.id;
      const userId = req.user.userId;
      const { isActive } = req.body;

      // Validation du paramètre isActive
      if (typeof isActive !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: "Le champ 'isActive' doit être un booléen (true/false)"
        });
      }

      const updatedProperty = await togglePropertyStatus(id, userId, isActive);
      
      if (!updatedProperty) {
        return res.status(404).json({
          success: false,
          message: "Propriété non trouvée"
        });
      }

      const statusMessage = isActive ? "activée" : "désactivée";
      
      res.status(200).json({
        success: true,
        message: `Propriété ${statusMessage} avec succès`,
        data: { property: updatedProperty }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PropertyController; 