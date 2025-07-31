// src/services/lockService.js

/**
 * Service de simulation de serrure connectée
 * Simule les appels API vers des serrures physiques (Nuki, Yale, etc.)
 * 
 * FUTUR: Remplacer par de vrais appels API vers les fabricants de serrures
 */

module.exports = {
  /**
   * Programme un code d'accès sur une serrure
   * @param {Object} params
   * @param {string} params.code - Code d'accès à programmer
   * @param {string} params.accessType - Type d'accès (temporary, permanent)
   * @param {string} params.propertyId - ID de la propriété
   * @param {string} params.userId - ID de l'utilisateur qui crée l'accès
   * @param {Date} params.expiresAt - Date d'expiration
   */
  async programAccessCode({ code, accessType, propertyId, userId, expiresAt }) {
    console.log(`🔐 Simulation: programmation du code ${code} (${accessType}) pour user ${userId} sur propriété ${propertyId} jusqu'à ${expiresAt}`);
    
    // Simulation d'un délai de programmation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // FUTUR: Appel réel vers API serrure
    // const response = await fetch(`https://api.nuki.io/locks/${lockId}/codes`, {
    //   method: 'POST',
    //   headers: { 'Authorization': `Bearer ${apiKey}` },
    //   body: JSON.stringify({ code, expiresAt })
    // });
    
    console.log(`✅ Code ${code} programmé avec succès sur la serrure`);
    return { success: true, code, programmedAt: new Date() };
  },

  /**
   * Révoque un code d'accès sur une serrure
   * @param {Object} params
   * @param {string} params.code - Code d'accès à révoquer
   * @param {string} params.propertyId - ID de la propriété
   * @param {string} params.reason - Raison de la révocation
   */
  async revokeAccessCode({ code, propertyId, reason }) {
    console.log(`❌ Simulation: révocation du code ${code} sur propriété ${propertyId} | Raison: ${reason}`);
    
    // Simulation d'un délai de révocation
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // FUTUR: Appel réel vers API serrure
    // const response = await fetch(`https://api.nuki.io/locks/${lockId}/codes/${code}`, {
    //   method: 'DELETE',
    //   headers: { 'Authorization': `Bearer ${apiKey}` }
    // });
    
    console.log(`✅ Code ${code} révoqué avec succès de la serrure`);
    return { success: true, code, revokedAt: new Date(), reason };
  },

  /**
   * Vérifie le statut d'une serrure
   * @param {string} propertyId - ID de la propriété
   */
  async getLockStatus(propertyId) {
    console.log(`🔍 Simulation: vérification du statut de la serrure pour propriété ${propertyId}`);
    
    // Simulation d'un statut aléatoire
    const statuses = ['locked', 'unlocked', 'error'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    return {
      propertyId,
      status: randomStatus,
      lastActivity: new Date(),
      batteryLevel: Math.floor(Math.random() * 100) + 1
    };
  }
}; 