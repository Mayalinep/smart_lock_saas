const prisma = require('../config/database');

/**
 * Service de gestion des propriétés
 */
class PropertyService {
  /**
   * Création d'une nouvelle propriété
   * @param {string} ownerId - ID du propriétaire
   * @param {Object} propertyData - Données de la propriété
   * @returns {Object} Propriété créée
   */
  static async createProperty(ownerId, propertyData) {
    const { name, address, description } = propertyData;

    // TODO: Valider les données d'entrée
    // TODO: Créer la propriété en base avec l'owner
    // TODO: Retourner la propriété créée

    throw new Error('Méthode createProperty à implémenter');
  }

  /**
   * Récupération des propriétés d'un utilisateur
   * @param {string} ownerId - ID du propriétaire
   * @returns {Array} Liste des propriétés
   */
  static async getUserProperties(ownerId) {
    // TODO: Récupérer toutes les propriétés de l'utilisateur
    // TODO: Inclure le nombre d'accès actifs par propriété
    // TODO: Retourner la liste

    throw new Error('Méthode getUserProperties à implémenter');
  }

  /**
   * Récupération d'une propriété par ID
   * @param {string} propertyId - ID de la propriété
   * @param {string} userId - ID de l'utilisateur (pour vérifier les droits)
   * @returns {Object} Propriété avec détails
   */
  static async getPropertyById(propertyId, userId) {
    // TODO: Récupérer la propriété avec les accès
    // TODO: Vérifier que l'utilisateur est le propriétaire
    // TODO: Retourner la propriété avec ses accès

    throw new Error('Méthode getPropertyById à implémenter');
  }

  /**
   * Mise à jour d'une propriété
   * @param {string} propertyId - ID de la propriété
   * @param {string} ownerId - ID du propriétaire
   * @param {Object} updateData - Données à mettre à jour
   * @returns {Object} Propriété mise à jour
   */
  static async updateProperty(propertyId, ownerId, updateData) {
    // TODO: Vérifier que l'utilisateur est le propriétaire
    // TODO: Valider les données
    // TODO: Mettre à jour la propriété
    // TODO: Retourner la propriété mise à jour

    throw new Error('Méthode updateProperty à implémenter');
  }

  /**
   * Suppression d'une propriété
   * @param {string} propertyId - ID de la propriété
   * @param {string} ownerId - ID du propriétaire
   */
  static async deleteProperty(propertyId, ownerId) {
    // TODO: Vérifier que l'utilisateur est le propriétaire
    // TODO: Supprimer tous les accès associés
    // TODO: Supprimer la propriété

    throw new Error('Méthode deleteProperty à implémenter');
  }

  /**
   * Activation/Désactivation d'une propriété
   * @param {string} propertyId - ID de la propriété
   * @param {string} ownerId - ID du propriétaire
   * @param {boolean} isActive - Statut actif
   * @returns {Object} Propriété mise à jour
   */
  static async togglePropertyStatus(propertyId, ownerId, isActive) {
    // TODO: Vérifier que l'utilisateur est le propriétaire
    // TODO: Mettre à jour le statut
    // TODO: Retourner la propriété mise à jour

    throw new Error('Méthode togglePropertyStatus à implémenter');
  }
}

module.exports = PropertyService; 