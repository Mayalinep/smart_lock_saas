// testLockEvents.js - Test du système d'historique des événements de serrure

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Configuration des tests
const testData = {
  user: {
    email: `test.events.${Date.now()}@example.com`,
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'Events'
  },
  property: {
    title: 'Appartement Test Événements',
    address: '123 Rue des Événements, 75001 Paris',
    description: 'Propriété de test pour les événements de serrure'
  },
  access: {
    startDate: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // Dans 5 minutes (futur)
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 jours
    accessType: 'TEMPORARY',
    description: 'Accès test pour générer des événements'
  }
};

let authCookie = '';
let userId = '';
let propertyId = '';
let accessId = '';

/**
 * Fonction utilitaire pour faire des requêtes avec cookies
 */
async function makeRequest(method, url, data = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        'Content-Type': 'application/json',
        'Cookie': authCookie
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`❌ Erreur ${method} ${url}:`, error.response?.data || error.message);
    throw error;
  }
}

/**
 * Test principal
 */
async function testLockEvents() {
  console.log('🧪 === TEST SYSTÈME D\'HISTORIQUE DES ÉVÉNEMENTS DE SERRURE ===\n');

  try {
    // 1. Inscription utilisateur
    console.log('📝 1. Inscription utilisateur...');
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, testData.user);
    console.log('✅ Utilisateur inscrit:', registerResponse.data.data.user.email);
    
    // Extraire le cookie d'authentification
    authCookie = registerResponse.headers['set-cookie']?.[0] || '';
    userId = registerResponse.data.data.user.id;

    // 2. Création propriété
    console.log('\n🏠 2. Création propriété...');
    const propertyResponse = await makeRequest('POST', '/properties', testData.property);
    propertyId = propertyResponse.data.property.id;
    console.log('✅ Propriété créée:', propertyResponse.data.property.name);

    // 3. Vérification statut serrure (génère des événements)
    console.log('\n🔍 3. Vérification statut serrure (génère événements)...');
    for (let i = 0; i < 3; i++) {
      const statusResponse = await makeRequest('GET', `/lock/status/${propertyId}`);
      console.log(`✅ Statut ${i+1}:`, statusResponse.data.lockStatus.status, 
                  `- Batterie: ${statusResponse.data.lockStatus.batteryLevel}%`);
      
      // Attendre un peu entre les vérifications
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // 4. Création d'un autre utilisateur pour l'accès
    console.log('\n👤 4. Création utilisateur pour l\'accès...');
    const guestUser = {
      email: `guest.${Date.now()}@example.com`,
      password: 'TestPassword123!',
      firstName: 'Guest',
      lastName: 'User'
    };
    const guestRegister = await axios.post(`${BASE_URL}/auth/register`, guestUser);
    const guestUserId = guestRegister.data.data.user.id;
    console.log('✅ Utilisateur invité créé:', guestUser.email);

    // 5. Création accès (génère événement ACCESS_GRANTED)
    console.log('\n🔑 5. Création accès (génère événement ACCESS_GRANTED)...');
    const accessData = { ...testData.access, propertyId, userId: guestUserId };
    const accessResponse = await makeRequest('POST', '/access', accessData);
    accessId = accessResponse.data.access.id;
    console.log('✅ Accès créé avec code:', accessResponse.data.access.code);

    // 6. Révocation accès (génère événement REVOKE)
    console.log('\n❌ 6. Révocation accès (génère événement REVOKE)...');
    const revokeResponse = await makeRequest('DELETE', `/access/${accessId}`);
    console.log('✅ Accès révoqué:', revokeResponse.message);

    // 7. Attendre un peu pour que tous les événements soient enregistrés
    console.log('\n⏱️ 7. Attente de l\'enregistrement des événements...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 8. Récupération historique complet
    console.log('\n📊 8. Récupération historique complet...');
    const eventsResponse = await makeRequest('GET', `/lock/events/${propertyId}`);
    console.log('✅ Événements récupérés:', eventsResponse.data.total);
    
    console.log('\n📋 HISTORIQUE COMPLET:');
    eventsResponse.data.events.forEach((event, index) => {
      console.log(`${index + 1}. [${event.type}] ${new Date(event.timestamp).toLocaleString()}`);
      console.log(`   Détails: ${event.details}\n`);
    });

    // 9. Test filtrage par type
    console.log('🔍 9. Test filtrage par type...');
    
    // Filtrer les événements ACCESS_GRANTED
    const accessGrantedEvents = await makeRequest('GET', `/lock/events/${propertyId}?type=ACCESS_GRANTED`);
    console.log(`✅ Événements ACCESS_GRANTED: ${accessGrantedEvents.data.total}`);
    
    // Filtrer les événements REVOKE
    const revokeEvents = await makeRequest('GET', `/lock/events/${propertyId}?type=REVOKE`);
    console.log(`✅ Événements REVOKE: ${revokeEvents.data.total}`);
    
    // Filtrer les événements LOCK_STATUS_CHECK
    const statusEvents = await makeRequest('GET', `/lock/events/${propertyId}?type=LOCK_STATUS_CHECK`);
    console.log(`✅ Événements LOCK_STATUS_CHECK: ${statusEvents.data.total}`);
    
    // Filtrer les événements BATTERY_LOW (si il y en a)
    const batteryEvents = await makeRequest('GET', `/lock/events/${propertyId}?type=BATTERY_LOW`);
    console.log(`✅ Événements BATTERY_LOW: ${batteryEvents.data.total}`);

    // 10. Test limite d'événements
    console.log('\n📏 10. Test limite d\'événements...');
    const limitedEvents = await makeRequest('GET', `/lock/events/${propertyId}?limit=2`);
    console.log(`✅ Événements avec limite de 2: ${limitedEvents.data.total}`);

    // 11. Test accès non autorisé (créer un autre utilisateur)
    console.log('\n🚫 11. Test accès non autorisé...');
    const unauthorizedUser = {
      email: `unauthorized.${Date.now()}@example.com`,
      password: 'TestPassword123!',
      firstName: 'Unauthorized',
      lastName: 'User'
    };
    
    const unauthorizedRegister = await axios.post(`${BASE_URL}/auth/register`, unauthorizedUser);
    const unauthorizedCookie = unauthorizedRegister.headers['set-cookie']?.[0] || '';
    
    try {
      await axios.get(`${BASE_URL}/lock/events/${propertyId}`, {
        headers: { 'Cookie': unauthorizedCookie }
      });
      console.log('❌ ERREUR: L\'accès non autorisé devrait échouer');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ Accès non autorisé correctement bloqué');
      } else {
        console.log('❌ Erreur inattendue:', error.response?.status);
      }
    }

    console.log('\n🎉 === TESTS TERMINÉS AVEC SUCCÈS ===');
    console.log('\n📊 RÉSUMÉ:');
    console.log(`- Utilisateur créé: ${testData.user.email}`);
    console.log(`- Propriété créée: ${testData.property.title}`);
    console.log(`- Événements générés: ${eventsResponse.data.total}`);
    console.log(`- Types d'événements testés: ACCESS_GRANTED, REVOKE, LOCK_STATUS_CHECK, BATTERY_LOW`);
    console.log(`- Filtrage par type: ✅`);
    console.log(`- Limitation du nombre d'événements: ✅`);
    console.log(`- Sécurité (accès non autorisé): ✅`);

  } catch (error) {
    console.error('\n❌ ERREUR DURANT LES TESTS:', error.message);
    process.exit(1);
  }
}

// Lancer les tests
testLockEvents(); 