const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testGetPropertyAccesses() {
  console.log('✏️ === Test Récupération des Accès de Propriété ===\n');

  let ownerToken;
  let otherUserToken;
  let propertyId;
  let targetUserId;
  let createdAccessIds = [];

  try {
    // 1. Connexion du propriétaire
    console.log('1️⃣ Connexion du propriétaire:');
    const ownerLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'jane.doe@example.com',
      password: 'Mot2Passe!'
    });

    if (ownerLoginResponse.data.success) {
      console.log('✅ Connexion propriétaire réussie');
      const cookies = ownerLoginResponse.headers['set-cookie'];
      const tokenCookie = cookies.find(cookie => cookie.startsWith('token='));
      ownerToken = tokenCookie ? tokenCookie.split(';')[0] : null;
    }

    console.log('\n---\n');

    // 2. Récupération de l'utilisateur cible
    console.log('2️⃣ Connexion utilisateur cible:');
    const targetLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'target.user@example.com',
      password: 'TargetPass123!'
    });

    if (targetLoginResponse.data.success) {
      targetUserId = targetLoginResponse.data.data.user.id;
      const cookies = targetLoginResponse.headers['set-cookie'];
      const tokenCookie = cookies.find(cookie => cookie.startsWith('token='));
      otherUserToken = tokenCookie ? tokenCookie.split(';')[0] : null;
      console.log(`✅ Utilisateur cible connecté: ${targetUserId}`);
    }

    console.log('\n---\n');

    // 3. Création d'une propriété
    console.log('3️⃣ Création d\'une propriété pour les tests:');
    const createPropertyResponse = await axios.post(`${BASE_URL}/properties`, {
      name: 'Propriété Test Accès Liste',
      address: '456 Rue Test Liste, Ville Accès',
      description: 'Propriété pour tester la liste des accès'
    }, {
      headers: { Cookie: ownerToken }
    });

    if (createPropertyResponse.data.success) {
      propertyId = createPropertyResponse.data.data.property.id;
      console.log(`✅ Propriété créée: ${propertyId}`);
    }

    console.log('\n---\n');

    // 4. Test récupération accès d'une propriété sans accès
    console.log('4️⃣ Test récupération accès propriété vide:');
    const emptyAccessesResponse = await axios.get(`${BASE_URL}/access/property/${propertyId}`, {
      headers: { Cookie: ownerToken }
    });

    if (emptyAccessesResponse.data.success) {
      console.log(`✅ Propriété vide: ${emptyAccessesResponse.data.data.accesses.length} accès`);
      console.log(`📄 Message: ${emptyAccessesResponse.data.message}`);
    }

    console.log('\n---\n');

    // 5. Création de plusieurs accès
    console.log('5️⃣ Création de 3 accès pour la propriété:');
    
    // Accès 1 - TEMPORARY
    const access1Response = await axios.post(`${BASE_URL}/access`, {
      propertyId,
      userId: targetUserId,
      startDate: '2025-08-01T09:00:00.000Z',
      endDate: '2025-08-05T17:00:00.000Z',
      accessType: 'TEMPORARY',
      description: 'Accès femme de ménage'
    }, {
      headers: { Cookie: ownerToken }
    });

    if (access1Response.data.success) {
      createdAccessIds.push(access1Response.data.data.access.id);
      console.log(`✅ Accès 1 créé - TEMPORARY - Code: ${access1Response.data.data.access.code}`);
    }

    // Attendre 100ms pour différencier les createdAt
    await new Promise(resolve => setTimeout(resolve, 100));

    // Accès 2 - PERMANENT
    const access2Response = await axios.post(`${BASE_URL}/access`, {
      propertyId,
      userId: targetUserId,
      startDate: '2025-08-10T00:00:00.000Z',
      endDate: '2025-12-31T23:59:59.000Z',
      accessType: 'PERMANENT',
      description: 'Accès locataire principal'
    }, {
      headers: { Cookie: ownerToken }
    });

    if (access2Response.data.success) {
      createdAccessIds.push(access2Response.data.data.access.id);
      console.log(`✅ Accès 2 créé - PERMANENT - Code: ${access2Response.data.data.access.code}`);
    }

    // Attendre 100ms pour différencier les createdAt
    await new Promise(resolve => setTimeout(resolve, 100));

    // Accès 3 - TEMPORARY
    const access3Response = await axios.post(`${BASE_URL}/access`, {
      propertyId,
      userId: targetUserId,
      startDate: '2025-09-01T08:00:00.000Z',
      endDate: '2025-09-07T20:00:00.000Z',
      accessType: 'TEMPORARY',
      description: 'Accès ouvrier réparations'
    }, {
      headers: { Cookie: ownerToken }
    });

    if (access3Response.data.success) {
      createdAccessIds.push(access3Response.data.data.access.id);
      console.log(`✅ Accès 3 créé - TEMPORARY - Code: ${access3Response.data.data.access.code}`);
    }

    console.log('\n---\n');

    // 6. Test sans token (devrait échouer)
    console.log('6️⃣ Test récupération sans token (devrait échouer):');
    try {
      await axios.get(`${BASE_URL}/access/property/${propertyId}`);
      console.log('❌ Problème: Devrait échouer sans token!');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log(`✅ Route protégée - Erreur attendue: ${error.response.data.message}`);
      } else {
        console.log('❌ Erreur inattendue:', error.message);
      }
    }

    console.log('\n---\n');

    // 7. Test avec propriété inexistante
    console.log('7️⃣ Test avec propriété inexistante (devrait échouer):');
    try {
      await axios.get(`${BASE_URL}/access/property/property-inexistante-123`, {
        headers: { Cookie: ownerToken }
      });
      console.log('❌ Problème: Devrait échouer avec propriété inexistante!');
    } catch (error) {
      if (error.response && error.response.status === 403) {
        console.log(`✅ Propriété inexistante rejetée - Erreur attendue: ${error.response.data.message}`);
      } else {
        console.log('❌ Erreur inattendue:', error.message);
      }
    }

    console.log('\n---\n');

    // 8. Test avec utilisateur non-propriétaire
    console.log('8️⃣ Test avec utilisateur non-propriétaire (devrait échouer):');
    try {
      await axios.get(`${BASE_URL}/access/property/${propertyId}`, {
        headers: { Cookie: otherUserToken }
      });
      console.log('❌ Problème: Devrait échouer avec utilisateur non-propriétaire!');
    } catch (error) {
      if (error.response && error.response.status === 403) {
        console.log(`✅ Accès non-propriétaire rejeté - Erreur attendue: ${error.response.data.message}`);
      } else {
        console.log('❌ Erreur inattendue:', error.message);
      }
    }

    console.log('\n---\n');

    // 9. Récupération complète des accès
    console.log('9️⃣ Récupération de tous les accès de la propriété:');
    const allAccessesResponse = await axios.get(`${BASE_URL}/access/property/${propertyId}`, {
      headers: { Cookie: ownerToken }
    });

    if (allAccessesResponse.data.success) {
      const accesses = allAccessesResponse.data.data.accesses;
      console.log(`✅ ${accesses.length} accès récupérés avec succès!`);
      console.log(`📄 Message: ${allAccessesResponse.data.message}`);
      
      console.log('\n📋 Détails des accès (triés par date de création décroissante):');
      accesses.forEach((access, index) => {
        console.log(`\n   ${index + 1}. Accès ${access.accessType}:`);
        console.log(`      🆔 ID: ${access.id}`);
        console.log(`      🔑 Code: ${access.code} (${access.code.length} chiffres)`);
        console.log(`      👤 Utilisateur: ${access.user.firstName} ${access.user.lastName} (${access.user.email})`);
        console.log(`      📅 Période: ${new Date(access.startDate).toLocaleDateString()} - ${new Date(access.endDate).toLocaleDateString()}`);
        console.log(`      📝 Description: ${access.description}`);
        console.log(`      📊 Statut: ${access.isActive ? 'ACTIF' : 'INACTIF'}`);
        console.log(`      🕐 Créé le: ${new Date(access.createdAt).toLocaleString()}`);
      });

      // Vérifier l'ordre de tri (plus récent en premier)
      if (accesses.length > 1) {
        const isCorrectOrder = new Date(accesses[0].createdAt) >= new Date(accesses[1].createdAt);
        console.log(`\n   ✅ Tri par date: ${isCorrectOrder ? 'CORRECT (plus récent en premier)' : 'INCORRECT'}`);
      }
    }

    console.log('\n---\n');

    // 10. Vérification du format de réponse
    console.log('🔟 Vérification du format de réponse:');
    if (allAccessesResponse.data.success) {
      const accesses = allAccessesResponse.data.data.accesses;
      const firstAccess = accesses[0];
      
      const requiredFields = ['id', 'code', 'accessType', 'startDate', 'endDate', 'isActive', 'user'];
      const userFields = ['id', 'email', 'firstName', 'lastName'];
      
      const hasAllFields = requiredFields.every(field => firstAccess.hasOwnProperty(field));
      const hasAllUserFields = userFields.every(field => firstAccess.user.hasOwnProperty(field));
      
      console.log(`✅ Format accès complet: ${hasAllFields ? 'OUI' : 'NON'}`);
      console.log(`✅ Format utilisateur complet: ${hasAllUserFields ? 'OUI' : 'NON'}`);
      console.log(`📊 Structure validée: ${hasAllFields && hasAllUserFields ? 'CONFORME' : 'NON CONFORME'}`);
    }

    console.log('\n🎯 Test de récupération des accès terminé !');

  } catch (error) {
    console.error('❌ Erreur dans le test:', error.response?.data || error.message);
  }
}

// Exécuter le test
testGetPropertyAccesses(); 