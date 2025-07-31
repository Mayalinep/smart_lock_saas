const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testDeleteProperty() {
  console.log('✏️ === Test de suppression de propriété ===\n');

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

    // 2. Création d'une propriété à supprimer
    console.log('2️⃣ Création d\'une propriété à supprimer:');
    const createResponse = await axios.post(`${BASE_URL}/properties`, {
      name: 'Propriété à Supprimer',
      address: '999 Rue Temporaire, Ville Test',
      description: 'Cette propriété sera supprimée dans le test'
    }, {
      headers: {
        Cookie: token
      }
    });

    if (createResponse.data.success) {
      propertyId = createResponse.data.data.property.id;
      console.log(`✅ Propriété créée: ${propertyId}`);
      console.log(`📄 Données: {
  name: '${createResponse.data.data.property.name}',
  address: '${createResponse.data.data.property.address}',
  description: '${createResponse.data.data.property.description}'
}`);
    }

    console.log('\n---\n');

    // 3. Vérification que la propriété existe avant suppression
    console.log('3️⃣ Vérification de l\'existence de la propriété:');
    const checkResponse = await axios.get(`${BASE_URL}/properties/${propertyId}`, {
      headers: {
        Cookie: token
      }
    });

    if (checkResponse.data.success) {
      console.log('✅ Propriété trouvée avant suppression');
      console.log(`📄 Name: ${checkResponse.data.data.property.name}`);
    }

    console.log('\n---\n');

    // 4. Test suppression sans token (devrait échouer)
    console.log('4️⃣ Test suppression sans token (devrait échouer):');
    try {
      await axios.delete(`${BASE_URL}/properties/${propertyId}`);
      console.log('❌ Problème: La suppression devrait échouer sans token!');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log(`✅ Route protégée - Erreur attendue: ${error.response.data.message}`);
      } else {
        console.log('❌ Erreur inattendue:', error.message);
      }
    }

    console.log('\n---\n');

    // 5. Suppression de la propriété avec token
    console.log('5️⃣ Suppression de la propriété:');
    const deleteResponse = await axios.delete(`${BASE_URL}/properties/${propertyId}`, {
      headers: {
        Cookie: token
      }
    });

    if (deleteResponse.data.success) {
      console.log('✅ Suppression réussie!');
      console.log(`📄 Message: ${deleteResponse.data.message}`);
      console.log(`📊 Status code: ${deleteResponse.status}`);
    }

    console.log('\n---\n');

    // 6. Vérification que la propriété n'existe plus
    console.log('6️⃣ Vérification que la propriété n\'existe plus:');
    try {
      await axios.get(`${BASE_URL}/properties/${propertyId}`, {
        headers: {
          Cookie: token
        }
      });
      console.log('❌ Problème: La propriété devrait être supprimée!');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log(`✅ Propriété bien supprimée - Erreur attendue: ${error.response.data.message}`);
        console.log(`📊 Status code: ${error.response.status}`);
      } else {
        console.log('❌ Erreur inattendue:', error.message);
      }
    }

    console.log('\n---\n');

    // 7. Test suppression d'un ID inexistant
    console.log('7️⃣ Test suppression avec ID inexistant (devrait échouer):');
    try {
      await axios.delete(`${BASE_URL}/properties/id-inexistant-123`, {
        headers: {
          Cookie: token
        }
      });
      console.log('❌ Problème: La suppression devrait échouer avec un ID inexistant!');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log(`✅ ID inexistant rejeté - Erreur attendue: ${error.response.data.message}`);
        console.log(`📊 Status code: ${error.response.status}`);
      } else {
        console.log('❌ Erreur inattendue:', error.message);
      }
    }

    console.log('\n---\n');

    // 8. Vérification finale avec liste des propriétés
    console.log('8️⃣ Vérification finale - Liste des propriétés:');
    const listResponse = await axios.get(`${BASE_URL}/properties`, {
      headers: {
        Cookie: token
      }
    });

    if (listResponse.data.success) {
      const deletedPropertyExists = listResponse.data.data.properties.find(p => p.id === propertyId);
      if (!deletedPropertyExists) {
        console.log('✅ Confirmation: La propriété supprimée n\'apparaît plus dans la liste');
        console.log(`📊 Nombre total de propriétés: ${listResponse.data.data.properties.length}`);
      } else {
        console.log('❌ Problème: La propriété supprimée apparaît encore dans la liste!');
      }
    }

    console.log('\n🎯 Test de suppression terminé !');

  } catch (error) {
    console.error('❌ Erreur dans le test:', error.response?.data || error.message);
  }
}

// Exécuter le test
testDeleteProperty(); 