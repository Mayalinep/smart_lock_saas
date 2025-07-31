const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testToggleStatus() {
  console.log('✏️ === Test Toggle Status de Propriété ===\n');

  let token;
  let propertyId;

  try {
    // 1. Connexion pour récupérer un token
    console.log('1️⃣ Connexion pour récupérer un token:');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'jane.doe@example.com',
      password: 'Mot2Passe!'
    });

    if (loginResponse.data.success) {
      console.log('✅ Connexion réussie');
      const cookies = loginResponse.headers['set-cookie'];
      const tokenCookie = cookies.find(cookie => cookie.startsWith('token='));
      token = tokenCookie ? tokenCookie.split(';')[0] : null;
      console.log(`🍪 Token reçu: ${token ? 'OUI' : 'NON'}`);
    }

    console.log('\n---\n');

    // 2. Création d'une propriété pour tester le toggle
    console.log('2️⃣ Création d\'une propriété pour le test:');
    const createResponse = await axios.post(`${BASE_URL}/properties`, {
      name: 'Propriété Test Toggle',
      address: '123 Rue Test Status, Ville Toggle',
      description: 'Propriété pour tester le changement de statut'
    }, {
      headers: {
        Cookie: token
      }
    });

    if (createResponse.data.success) {
      propertyId = createResponse.data.data.property.id;
      const initialStatus = createResponse.data.data.property.isActive;
      console.log(`✅ Propriété créée: ${propertyId}`);
      console.log(`📄 Statut initial: ${initialStatus ? 'ACTIVE' : 'INACTIVE'}`);
    }

    console.log('\n---\n');

    // 3. Test sans token (devrait échouer)
    console.log('3️⃣ Test toggle sans token (devrait échouer):');
    try {
      await axios.patch(`${BASE_URL}/properties/${propertyId}/status`, {
        isActive: false
      });
      console.log('❌ Problème: Le toggle devrait échouer sans token!');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log(`✅ Route protégée - Erreur attendue: ${error.response.data.message}`);
      } else {
        console.log('❌ Erreur inattendue:', error.message);
      }
    }

    console.log('\n---\n');

    // 4. Désactivation de la propriété
    console.log('4️⃣ Désactivation de la propriété:');
    const deactivateResponse = await axios.patch(`${BASE_URL}/properties/${propertyId}/status`, {
      isActive: false
    }, {
      headers: {
        Cookie: token
      }
    });

    if (deactivateResponse.data.success) {
      console.log('✅ Désactivation réussie!');
      console.log(`📄 Message: ${deactivateResponse.data.message}`);
      console.log(`📊 Nouveau statut: ${deactivateResponse.data.data.property.isActive ? 'ACTIVE' : 'INACTIVE'}`);
      console.log(`📅 Mis à jour le: ${deactivateResponse.data.data.property.updatedAt}`);
    }

    console.log('\n---\n');

    // 5. Réactivation de la propriété
    console.log('5️⃣ Réactivation de la propriété:');
    const activateResponse = await axios.patch(`${BASE_URL}/properties/${propertyId}/status`, {
      isActive: true
    }, {
      headers: {
        Cookie: token
      }
    });

    if (activateResponse.data.success) {
      console.log('✅ Activation réussie!');
      console.log(`📄 Message: ${activateResponse.data.message}`);
      console.log(`📊 Nouveau statut: ${activateResponse.data.data.property.isActive ? 'ACTIVE' : 'INACTIVE'}`);
      console.log(`📅 Mis à jour le: ${activateResponse.data.data.property.updatedAt}`);
    }

    console.log('\n---\n');

    // 6. Test avec données invalides
    console.log('6️⃣ Test avec données invalides (devrait échouer):');
    try {
      await axios.patch(`${BASE_URL}/properties/${propertyId}/status`, {
        isActive: "invalid" // String au lieu de boolean
      }, {
        headers: {
          Cookie: token
        }
      });
      console.log('❌ Problème: Devrait rejeter les données non-booléennes!');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log(`✅ Validation réussie - Erreur attendue: ${error.response.data.message}`);
        console.log(`📊 Status code: ${error.response.status}`);
      } else {
        console.log('❌ Erreur inattendue:', error.message);
      }
    }

    console.log('\n---\n');

    // 7. Test avec ID inexistant
    console.log('7️⃣ Test avec ID inexistant (devrait échouer):');
    try {
      await axios.patch(`${BASE_URL}/properties/id-inexistant-123/status`, {
        isActive: true
      }, {
        headers: {
          Cookie: token
        }
      });
      console.log('❌ Problème: Devrait échouer avec un ID inexistant!');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log(`✅ ID inexistant rejeté - Erreur attendue: ${error.response.data.message}`);
        console.log(`📊 Status code: ${error.response.status}`);
      } else {
        console.log('❌ Erreur inattendue:', error.message);
      }
    }

    console.log('\n---\n');

    // 8. Vérification finale avec GET
    console.log('8️⃣ Vérification finale du statut:');
    const finalCheckResponse = await axios.get(`${BASE_URL}/properties/${propertyId}`, {
      headers: {
        Cookie: token
      }
    });

    if (finalCheckResponse.data.success) {
      const finalProperty = finalCheckResponse.data.data.property;
      console.log('✅ Vérification finale réussie!');
      console.log(`📄 Statut final: ${finalProperty.isActive ? 'ACTIVE' : 'INACTIVE'}`);
      console.log(`📅 Dernière mise à jour: ${finalProperty.updatedAt}`);
      console.log(`🆔 ID confirmé: ${finalProperty.id}`);
    }

    console.log('\n---\n');

    // 9. Test de multiple toggles rapides
    console.log('9️⃣ Test de toggles multiples rapides:');
    
    // Toggle 1: false
    await axios.patch(`${BASE_URL}/properties/${propertyId}/status`, {
      isActive: false
    }, {
      headers: { Cookie: token }
    });
    console.log('📴 Toggle 1: DÉSACTIVÉ');

    // Toggle 2: true
    await axios.patch(`${BASE_URL}/properties/${propertyId}/status`, {
      isActive: true
    }, {
      headers: { Cookie: token }
    });
    console.log('📴 Toggle 2: ACTIVÉ');

    // Toggle 3: false
    const finalToggle = await axios.patch(`${BASE_URL}/properties/${propertyId}/status`, {
      isActive: false
    }, {
      headers: { Cookie: token }
    });
    
    if (finalToggle.data.success) {
      console.log('📴 Toggle 3: DÉSACTIVÉ');
      console.log(`✅ Statut final après toggles multiples: ${finalToggle.data.data.property.isActive ? 'ACTIVE' : 'INACTIVE'}`);
    }

    console.log('\n🎯 Test de toggle status terminé !');

  } catch (error) {
    console.error('❌ Erreur dans le test:', error.response?.data || error.message);
  }
}

// Exécuter le test
testToggleStatus(); 