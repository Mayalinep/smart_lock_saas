const prisma = require('../config/database');
const cache = require('./cache');

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

/**
 * Fonction de création d'une propriété
 * @param {Object} data - Données de la propriété
 * @param {string} userId - ID du propriétaire
 * @returns {Object} Propriété créée
 */
async function createProperty(data, userId) {
  // 1. Vérifier que title et address sont présents
  if (!data.title || !data.address) {
    const error = new Error('Le titre et l\'adresse de la propriété sont obligatoires');
    error.status = 400;
    throw error;
  }

  // 2. Créer une propriété avec Prisma
  const newProperty = await prisma.property.create({
    data: {
      name: data.title, // Mapper title vers name pour la base
      address: data.address,
      description: data.description || '',
      owner: { connect: { id: userId } }
    }
  });

  // 3. Retourner l'objet créé
  return newProperty;
}

/**
 * Fonction de récupération des propriétés d'un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @returns {Array} Tableau des propriétés
 */
async function getUserProperties(userId) {
  // 1. Cache 1h
  const cacheKey = `user:${userId}:properties`;
  const cached = await cache.get(cacheKey);
  if (cached) return cached;

  // 2. Utiliser Prisma pour récupérer toutes les propriétés liées à l'utilisateur
  const properties = await prisma.property.findMany({
    where: { ownerId: userId }
  });

  // 3. Mettre en cache 1h
  await cache.set(cacheKey, properties, 3600);

  // 4. Retourner le tableau de propriétés
  return properties;
}

/**
 * Fonction de récupération d'une propriété par ID
 * @param {string} id - ID de la propriété
 * @param {string} userId - ID de l'utilisateur (propriétaire)
 * @returns {Object|null} Propriété trouvée ou null
 */
async function getPropertyById(id, userId) {
  // 1. Utiliser Prisma pour récupérer UNE propriété par son id ET ownerId
  const property = await prisma.property.findFirst({
    where: {
      id,
      ownerId: userId
    }
  });

  // 2. Retourner la propriété (ou null si non trouvée)
  return property;
}

/**
 * Fonction de mise à jour d'une propriété
 * @param {string} id - ID de la propriété
 * @param {string} userId - ID de l'utilisateur (propriétaire)
 * @param {Object} data - Nouvelles données
 * @returns {Object|null} Propriété mise à jour ou null si non trouvée
 */
async function updateProperty(id, userId, data) {
  // 1. Vérifier que la propriété existe et appartient à l'utilisateur
  const existingProperty = await getPropertyById(id, userId);
  
  if (!existingProperty) {
    return null;
  }

  // 2. Valider les données (optionnel car Prisma le fait aussi)
  const updateData = {};
  if (data.name) updateData.name = data.name;
  if (data.address) updateData.address = data.address;
  if (data.description !== undefined) updateData.description = data.description;

  // 3. Mettre à jour la propriété
  const updatedProperty = await prisma.property.update({
    where: { id },
    data: updateData
  });

  // 4. Retourner la propriété mise à jour
  return updatedProperty;
}

/**
 * Supprime une propriété
 * @param {string} id - ID de la propriété
 * @param {string} userId - ID de l'utilisateur (propriétaire)
 * @returns {boolean|null} true si supprimée, null si non trouvée
 */
async function deleteProperty(id, userId) {
  // 1. Vérifier que la propriété existe et appartient à l'utilisateur
  const existingProperty = await getPropertyById(id, userId);
  
  if (!existingProperty) {
    return null;
  }

  // 2. Supprimer la propriété
  await prisma.property.delete({
    where: { id }
  });

  // 3. Retourner true pour confirmer la suppression
  return true;
}

/**
 * Active/Désactive une propriété
 * @param {string} id - ID de la propriété
 * @param {string} userId - ID de l'utilisateur (propriétaire)
 * @param {boolean} isActive - Nouveau statut actif/inactif
 * @returns {Object|null} Propriété mise à jour ou null si non trouvée
 */
async function togglePropertyStatus(id, userId, isActive) {
  // 1. Vérifier que la propriété existe et appartient à l'utilisateur
  const existingProperty = await getPropertyById(id, userId);
  
  if (!existingProperty) {
    return null;
  }

  // 2. Mettre à jour uniquement le champ isActive
  const updatedProperty = await prisma.property.update({
    where: { id },
    data: { isActive }
  });

  // 3. Retourner la propriété mise à jour
  return updatedProperty;
}

module.exports = { 
  PropertyService, 
  createProperty, 
  getUserProperties, 
  getPropertyById, 
  updateProperty, 
  deleteProperty, 
  togglePropertyStatus 
}; 