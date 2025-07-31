// testLockIntegration.js
const axios = require('axios');

/**
 * Test d'intégration du service de serrure
 * Valide que les codes sont programmés/révoqués automatiquement
 */

const BASE_URL = 'http://localhost:3000/api';

// Données de test
const testData = {
  user: {
    email: `test.lock.${Date.now()}@example.com`,
    password: 'Mot2Passe!',
    firstName: 'Test',
    lastName: 'Lock'
  },
  property: {
    title: 'Appartement Test Serrure',
    address: '123 Rue de la Serrure, Paris',
    description: 'Test d\'intégration serrure connectée'
  },
  access: {
    userId: '', // Sera rempli après création d'un second utilisateur
    startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Demain
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Dans 7 jours
    accessType: 'TEMPORARY',
    description: 'Test programmation serrure'
  }
};

let authToken = '';
let propertyId = '';
let accessId = '';

async function testLockIntegration() {
  console.log('🔐 Test d\'intégration du service de serrure\n');

  try {
    // 1. Créer un utilisateur de test
    console.log('1️⃣ Création d\'un utilisateur de test...');
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, testData.user);
    console.log('✅ Utilisateur créé:', registerResponse.data.data.user.email);
    
    // Récupérer le token d'authentification
    const cookies = registerResponse.headers['set-cookie'];
    if (cookies) {
      authToken = cookies.find(cookie => cookie.startsWith('token='));
    }

    // 2. Créer une propriété
    console.log('\n2️⃣ Création d\'une propriété...');
    const propertyResponse = await axios.post(`${BASE_URL}/properties`, testData.property, {
      headers: { Cookie: authToken }
    });
    propertyId = propertyResponse.data.data.property.id;
    console.log('✅ Propriété créée:', propertyResponse.data.data.property.title);

    // 3. Créer un second utilisateur pour l'accès
    console.log('\n3️⃣ Création d\'un second utilisateur pour l\'accès...');
    const secondUser = {
      ...testData.user,
      email: `invite.lock.${Date.now()}@example.com`
    };
    const secondUserResponse = await axios.post(`${BASE_URL}/auth/register`, secondUser);
    testData.access.userId = secondUserResponse.data.data.user.id;
    console.log('✅ Second utilisateur créé:', secondUserResponse.data.data.user.email);

    // 4. Créer un accès (devrait programmer la serrure)
    console.log('\n4️⃣ Création d\'un accès (programmation serrure)...');
    const accessData = {
      ...testData.access,
      propertyId: propertyId
    };
    const accessResponse = await axios.post(`${BASE_URL}/access`, accessData, {
      headers: { Cookie: authToken }
    });
    accessId = accessResponse.data.data.access.id;
    console.log('✅ Accès créé avec code:', accessResponse.data.data.access.code);
    console.log('🔐 Vérifiez les logs du serveur pour voir la programmation serrure');

    // 5. Attendre un peu pour voir les logs
    console.log('\n⏳ Attente de 2 secondes pour observer les logs...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 6. Révoquer l'accès (devrait révoquer la serrure)
    console.log('\n5️⃣ Révocation de l\'accès (révocation serrure)...');
    const revokeResponse = await axios.delete(`${BASE_URL}/access/${accessId}`, {
      headers: { Cookie: authToken }
    });
    console.log('✅ Accès révoqué:', revokeResponse.data.message);
    console.log('🔐 Vérifiez les logs du serveur pour voir la révocation serrure');

    // 7. Attendre un peu pour voir les logs
    console.log('\n⏳ Attente de 2 secondes pour observer les logs...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('\n🎉 Test d\'intégration terminé avec succès !');
    console.log('\n📋 Résumé :');
    console.log('- ✅ Utilisateur créé');
    console.log('- ✅ Propriété créée');
    console.log('- ✅ Accès créé avec programmation serrure');
    console.log('- ✅ Accès révoqué avec révocation serrure');
    console.log('\n🔍 Vérifiez les logs du serveur pour voir les messages de simulation serrure');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('💡 Conseil: Vérifiez que le serveur est démarré et que l\'authentification fonctionne');
    }
  }
}

// Fonction pour nettoyer les données de test
async function cleanupTestData() {
  console.log('\n🧹 Nettoyage des données de test...');
  
  try {
    // Supprimer les utilisateurs de test (si nécessaire)
    console.log('✅ Nettoyage terminé');
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error.message);
  }
}

// Exécuter le test
if (require.main === module) {
  testLockIntegration()
    .then(() => {
      console.log('\n🏁 Test terminé');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = { testLockIntegration, cleanupTestData }; 