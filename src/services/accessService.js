const prisma = require('../config/database');
const lockService = require('./lockService');
const { hashAccessCode, compareAccessCode } = require('../utils/codeHash');
const cache = require('./cache');

/**
 * Service de gestion des accès
 */
class AccessService {
  /**
   * Création d'un nouvel accès
   * @param {string} propertyId - ID de la propriété
   * @param {string} ownerId - ID du propriétaire
   * @param {Object} accessData - Données de l'accès
   * @returns {Object} Accès créé
   */
  static async createAccess(propertyId, ownerId, accessData) {
    const { userId, startDate, endDate, accessType, description } = accessData;

    // 1. Vérifier que l'utilisateur est propriétaire de la propriété
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        ownerId: ownerId
      }
    });

    if (!property) {
      const error = new Error('Accès non autorisé à cette propriété');
      error.status = 403;
      throw error;
    }

    // 2. Vérifier que l'utilisateur cible existe
    const targetUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!targetUser) {
      const error = new Error('Utilisateur cible non trouvé');
      error.status = 404;
      throw error;
    }

    // Vérifier que l'utilisateur cible n'est pas le propriétaire
    if (userId === ownerId) {
      const error = new Error('Tu es déjà propriétaire');
      error.status = 400;
      throw error;
    }

    // 3. Valider les dates
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Vérifier que les dates sont valides
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      const error = new Error('Dates invalides - Format incorrect');
      error.status = 400;
      throw error;
    }

    // Vérifier que startDate < endDate
    if (start >= end) {
      const error = new Error('Dates invalides - La date de début doit être antérieure à la date de fin');
      error.status = 400;
      throw error;
    }

    // Vérifier que les dates sont dans le futur
    if (start <= now) {
      const error = new Error('Dates invalides - La date de début doit être dans le futur');
      error.status = 400;
      throw error;
    }

    // 4. Générer un code d'accès unique
    const accessCode = await this.generateAccessCode(accessType);

    // 5. Créer l'accès en base (avec hashage du code)
    const newAccess = await prisma.access.create({
      data: {
        propertyId,
        userId,
        ownerId,
        startDate: start,
        endDate: end,
        accessType,
        code: accessCode,
        hashedCode: hashAccessCode(accessCode),
        description: description || '',
        isActive: true
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        property: {
          select: {
            id: true,
            name: true,
            address: true
          }
        },
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // 6. Programmer le code sur la serrure connectée
    try {
      await lockService.programAccessCode({
        code: newAccess.code,
        accessType: newAccess.accessType,
        propertyId,
        userId,
        expiresAt: newAccess.endDate,
      });
    } catch (error) {
      console.error('❌ Erreur lors de la programmation sur la serrure:', error.message);
      // On continue même si la serrure échoue - l'accès est créé en base
    }

    // 7. Invalider cache lié à la propriété (listes d'accès et lock status)
    try {
      await cache.del(`access:property:${propertyId}`);
      await cache.del(`lock:status:${propertyId}`);
    } catch (_) {}

    // 8. Retourner l'accès créé
    return newAccess;
  }

  /**
   * Récupération des accès pour une propriété
   * @param {string} propertyId - ID de la propriété
   * @param {string} ownerId - ID du propriétaire
   * @returns {Array} Liste des accès
   */
  static async getPropertyAccesses(propertyId, ownerId) {
    // 1. Vérifier que l'utilisateur est propriétaire de la propriété
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        ownerId: ownerId
      }
    });

    if (!property) {
      const error = new Error('Accès non autorisé à cette propriété');
      error.status = 403;
      throw error;
    }

    // 2. Cache: liste des accès d'une propriété
    const cacheKey = `access:property:${propertyId}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    // 3. Récupérer tous les accès de la propriété avec les infos utilisateur
    const accesses = await prisma.access.findMany({
      where: {
        propertyId: propertyId,
        revokedAt: null       // Exclure les accès révoqués (soft delete)
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc' // Tri par date de création décroissant
      }
    });

    // 4. Mettre en cache (TTL 10 min)
    await cache.set(cacheKey, accesses, 600);

    // 5. Retourner la liste des accès trouvés
    return accesses;
  }

  /**
   * Récupération des accès d'un utilisateur
   * @param {string} userId - ID de l'utilisateur
   * @returns {Array} Liste des accès de l'utilisateur
   */
  static async getUserAccesses(userId) {
    const now = new Date();

    // Récupérer tous les accès de l'utilisateur avec filtres
    const accesses = await prisma.access.findMany({
      where: {
        userId: userId,
        isActive: true,        // Accès actifs seulement
        revokedAt: null,       // Exclure les accès révoqués (soft delete)
        endDate: {            // Date de fin dans le futur
          gt: now
        }
      },
      include: {
        property: {
          select: {
            name: true,
            address: true
          }
        }
      },
      orderBy: {
        endDate: 'asc' // Tri par date de fin croissante (plus urgent en premier)
      }
    });

    // Retourner la liste des accès avec format souhaité
    return accesses;
  }

  /**
   * Récupération de l'historique complet des accès d'une propriété (y compris révoqués)
   * @param {string} propertyId - ID de la propriété
   * @param {string} ownerId - ID du propriétaire
   * @returns {Array} Historique complet des accès
   */
  static async getPropertyAccessHistory(propertyId, ownerId) {
    // 1. Vérifier que l'utilisateur est propriétaire de la propriété
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        ownerId: ownerId
      }
    });

    if (!property) {
      const error = new Error('Accès non autorisé à cette propriété');
      error.status = 403;
      throw error;
    }

    // 2. Récupérer TOUS les accès (actifs ET révoqués)
    const allAccesses = await prisma.access.findMany({
      where: {
        propertyId: propertyId
        // Pas de filtrage sur revokedAt pour voir l'historique complet
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc' // Plus récent en premier
      }
    });

    // 3. Enrichir les données avec le statut
    const enrichedAccesses = allAccesses.map(access => ({
      ...access,
      status: access.revokedAt ? 'RÉVOQUÉ' : (access.isActive ? 'ACTIF' : 'INACTIF'),
      isRevoked: !!access.revokedAt
    }));

    return enrichedAccesses;
  }

  /**
   * Récupération d'un accès par ID
   * @param {string} accessId - ID de l'accès
   * @param {string} userId - ID de l'utilisateur (pour vérifier les droits)
   * @returns {Object} Détails de l'accès
   */
  static async getAccessById(accessId, userId) {
    // TODO: Récupérer l'accès avec propriété et utilisateur
    // TODO: Vérifier les droits (propriétaire ou utilisateur de l'accès)
    // TODO: Retourner les détails

    throw new Error('Méthode getAccessById à implémenter');
  }

  /**
   * Mise à jour d'un accès
   * @param {string} accessId - ID de l'accès
   * @param {string} ownerId - ID du propriétaire
   * @param {Object} updateData - Données à mettre à jour
   * @returns {Object} Accès mis à jour
   */
  static async updateAccess(accessId, ownerId, updateData) {
    // TODO: Vérifier que l'utilisateur est propriétaire de la propriété
    // TODO: Valider les nouvelles données
    // TODO: Mettre à jour l'accès
    // TODO: Retourner l'accès mis à jour

    throw new Error('Méthode updateAccess à implémenter');
  }

  /**
   * Révocation d'un accès (soft delete avec traçabilité)
   * @param {string} accessId - ID de l'accès
   * @param {string} ownerId - ID du propriétaire
   * @returns {Object} Résultat de la révocation
   */
  static async deleteAccessById(accessId, ownerId) {
    // 1. Vérifier si l'accès existe et récupérer la propriété
    const access = await prisma.access.findUnique({
      where: { id: accessId },
      include: {
        property: {
          select: {
            ownerId: true
          }
        }
      }
    });

    // 2. Vérifier que l'accès existe ET que le propriétaire est autorisé
    if (!access || access.property.ownerId !== ownerId) {
      const error = new Error('Accès non trouvé ou non autorisé');
      error.status = 404;
      throw error;
    }

    // 3. Vérifier si l'accès n'est pas déjà révoqué
    if (access.revokedAt) {
      const error = new Error('Accès déjà révoqué');
      error.status = 400;
      throw error;
    }

    // 4. Soft delete : révocation avec traçabilité
    const revokedAccess = await prisma.access.update({
      where: { id: accessId },
      data: {
        isActive: false,        // Désactiver l'accès
        revokedAt: new Date(),  // Horodatage de révocation
        revokedBy: ownerId      // Qui a révoqué l'accès
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        property: {
          select: {
            name: true,
            address: true
          }
        }
      }
    });

    // 5. Révoquer le code sur la serrure connectée
    try {
      await lockService.revokeAccessCode({
        code: access.code,
        propertyId: access.propertyId,
        reason: 'Révocation manuelle par le propriétaire',
      });
    } catch (error) {
      console.error('❌ Erreur lors de la révocation sur la serrure:', error.message);
      // On continue même si la serrure échoue - l'accès est révoqué en base
    }

    // 6. Retourner le succès avec informations de traçabilité
    return {
      success: true,
      message: 'Accès révoqué avec succès',
      data: {
        access: revokedAccess,
        revokedAt: revokedAccess.revokedAt,
        revokedBy: ownerId
      }
    };
  }

  /**
   * Révocation d'un accès
   * @param {string} accessId - ID de l'accès
   * @param {string} ownerId - ID du propriétaire
   */
  static async revokeAccess(accessId, ownerId) {
    // TODO: Vérifier que l'utilisateur est propriétaire
    // TODO: Désactiver l'accès
    // TODO: Optionnel: Notifier l'utilisateur

    throw new Error('Méthode revokeAccess à implémenter');
  }

  /**
   * Validation d'un code d'accès
   * @param {string} accessCode - Code d'accès
   * @param {string} propertyId - ID de la propriété
   * @returns {Object} Résultat de la validation
   */
  static async validateAccessCode(accessCode, propertyId) {
    const now = new Date();

    // 1) Cache: validation par code
    const cacheKey = `access:validate:${propertyId}:${accessCode}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    // 2) Tenter de retrouver l'accès par code exact (legacy) OU par propriété
    // On limite aux accès de la propriété donnée et non révoqués
    const candidates = await prisma.access.findMany({
      where: {
        propertyId,
        revokedAt: null,
        isActive: true
      }
    });

    // 3) Vérifier le code contre hashedCode (fallback sur code clair si présent)
    const matched = candidates.find(a => {
      if (a.hashedCode) return compareAccessCode(accessCode, a.hashedCode);
      return a.code === accessCode; // compat legacy
    });

    if (!matched) {
      return { valid: false, reason: 'CODE_INVALID' };
    }

    // 4) Vérifier fenêtre de validité
    if (matched.startDate > now) {
      const result = { valid: false, reason: 'NOT_STARTED' };
      // Cache court pour éviter marteau (TTL 60s)
      await cache.set(cacheKey, result, 60);
      return result;
    }
    if (matched.endDate <= now) {
      const result = { valid: false, reason: 'EXPIRED' };
      await cache.set(cacheKey, result, 60);
      return result;
    }

    // 5) OK → TTL = durée restante de validité (max 24h)
    const ttl = Math.min(24 * 3600, Math.max(1, Math.floor((matched.endDate - now) / 1000)));
    const result = { valid: true, accessId: matched.id, propertyId: matched.propertyId, userId: matched.userId };
    await cache.set(cacheKey, result, ttl);
    return result;
  }

  /**
   * Génération d'un code d'accès unique
   * @param {string} accessType - Type d'accès
   * @returns {string} Code d'accès
   */
  static async generateAccessCode(accessType) {
    let code;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      // Générer un code selon le type
      if (accessType === 'TEMPORARY') {
        // Code PIN de 6 chiffres pour accès temporaire
        code = Math.floor(100000 + Math.random() * 900000).toString();
      } else if (accessType === 'PERMANENT') {
        // Code plus long pour accès permanent
        code = Math.floor(10000000 + Math.random() * 90000000).toString();
      } else {
        // Code par défaut
        code = Math.floor(100000 + Math.random() * 900000).toString();
      }

      // Vérifier l'unicité en base
      const existingAccess = await prisma.access.findFirst({
        where: { code }
      });

      attempts++;
      
      if (!existingAccess) {
        return code; // Code unique trouvé
      }

      if (attempts >= maxAttempts) {
        throw new Error('Impossible de générer un code unique après plusieurs tentatives');
      }

    } while (attempts < maxAttempts);

    return code;
  }

  /**
   * Nettoyage des accès expirés
   * @returns {number} Nombre d'accès nettoyés
   */
  static async cleanupExpiredAccesses() {
    // TODO: Identifier les accès expirés
    // TODO: Les marquer comme inactifs ou les supprimer
    // TODO: Retourner le nombre d'accès traités

    throw new Error('Méthode cleanupExpiredAccesses à implémenter');
  }

  /**
   * Récupère le statut d'une serrure pour une propriété
   * @param {string} propertyId - ID de la propriété
   * @param {string} ownerId - ID du propriétaire
   * @returns {Object} Statut de la serrure
   */
  static async getLockStatus(propertyId, ownerId) {
    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property || property.ownerId !== ownerId) {
      throw new Error('Accès non autorisé à cette propriété');
    }
    const cacheKey = `lock:status:${propertyId}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;
    const status = await lockService.getLockStatus(propertyId);
    await cache.set(cacheKey, status, 300); // 5 min
    return status;
  }
}

module.exports = AccessService; 