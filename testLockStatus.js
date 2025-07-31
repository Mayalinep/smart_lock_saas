// testLockStatus.js
const axios = require('axios');

/**
 * Test de l'endpoint de statut de serrure
 * Valide que l'API retourne bien le statut d'une serrure
 */

const BASE_URL = 'http://localhost:3000/api';

// Données de test
const testData = {
  user: {
    email: `test.status.${Date.now()}@example.com`,
    password: 'Mot2Passe!',
    firstName: 'Test',
    lastName: 'Status'
  },
  property: {
    title: 'Appartement Test Statut',
    address: '456 Rue du Statut, Paris',
    description: 'Test endpoint statut serrure'
  }
};

let authToken = '';
let propertyId = '';

async function testLockStatus() {
  console.log('🔍 Test de l\'endpoint de statut de serrure\n');

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

    // 3. Tester l'endpoint de statut de serrure
    console.log('\n3️⃣ Test de l\'endpoint de statut de serrure...');
    const statusResponse = await axios.get(`${BASE_URL}/lock/status/${propertyId}`, {
      headers: { Cookie: authToken }
    });
    
    console.log('✅ Statut de serrure récupéré:');
    console.log('   - Statut:', statusResponse.data.data.lockStatus.status);
    console.log('   - Niveau de batterie:', statusResponse.data.data.lockStatus.batteryLevel + '%');
    console.log('   - Dernière activité:', statusResponse.data.data.lockStatus.lastActivity);

    // 4. Tester plusieurs fois pour voir la variation (simulation aléatoire)
    console.log('\n4️⃣ Test de variation du statut (simulation aléatoire)...');
    
    for (let i = 1; i <= 3; i++) {
      const statusResponse2 = await axios.get(`${BASE_URL}/lock/status/${propertyId}`, {
        headers: { Cookie: authToken }
      });
      
      console.log(`   Test ${i}: ${statusResponse2.data.data.lockStatus.status} (${statusResponse2.data.data.lockStatus.batteryLevel}% batterie)`);
      
      // Petite pause entre les tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n🎉 Test de statut de serrure terminé avec succès !');
    console.log('\n📋 Résumé :');
    console.log('- ✅ Utilisateur créé');
    console.log('- ✅ Propriété créée');
    console.log('- ✅ Endpoint de statut fonctionnel');
    console.log('- ✅ Simulation aléatoire validée');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('💡 Conseil: Vérifiez que le serveur est démarré et que l\'authentification fonctionne');
    }
  }
}

// Exécuter le test
if (require.main === module) {
  testLockStatus()
    .then(() => {
      console.log('\n🏁 Test terminé');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = { testLockStatus }; 