const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testGetUserAccesses() {
  console.log('✏️ === Test Récupération de Mes Accès Personnels ===\n');

  let ownerToken;
  let targetUserToken;
  let propertyId1, propertyId2;
  let targetUserId;
  let createdAccessIds = [];

  try {
    // 1. Connexion utilisateur cible (qui va recevoir les accès)
    console.log('1️⃣ Connexion utilisateur cible:');
    const targetLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'target.user@example.com',
      password: 'TargetPass123!'
    });

    if (targetLoginResponse.data.success) {
      targetUserId = targetLoginResponse.data.data.user.id;
      const cookies = targetLoginResponse.headers['set-cookie'];
      const tokenCookie = cookies.find(cookie => cookie.startsWith('token='));
      targetUserToken = tokenCookie ? tokenCookie.split(';')[0] : null;
      console.log(`✅ Connexion utilisateur cible réussie: ${targetUserId}`);
    }

    console.log('\n---\n');

    // 2. Test mes accès au début (devrait être vide)
    console.log('2️⃣ Test mes accès au début (devrait être vide):');
    const initialAccessesResponse = await axios.get(`${BASE_URL}/access/my-accesses`, {
      headers: { Cookie: targetUserToken }
    });

    if (initialAccessesResponse.data.success) {
      console.log(`✅ Mes accès initiaux: ${initialAccessesResponse.data.data.accesses.length} accès`);
      console.log(`📄 Message: ${initialAccessesResponse.data.message}`);
    }

    console.log('\n---\n');

    // 3. Connexion du propriétaire
    console.log('3️⃣ Connexion du propriétaire:');
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

    // 4. Création de deux propriétés
    console.log('4️⃣ Création de propriétés pour les tests:');
    
    // Propriété 1
    const property1Response = await axios.post(`${BASE_URL}/properties`, {
      name: 'Appartement Centre Ville',
      address: '123 Rue de la Paix, Paris',
      description: 'Appartement moderne au centre ville'
    }, {
      headers: { Cookie: ownerToken }
    });

    if (property1Response.data.success) {
      propertyId1 = property1Response.data.data.property.id;
      console.log(`✅ Propriété 1 créée: ${property1Response.data.data.property.name}`);
    }

    // Propriété 2
    const property2Response = await axios.post(`${BASE_URL}/properties`, {
      name: 'Maison de Campagne',
      address: '456 Chemin des Bois, Campagne',
      description: 'Belle maison avec jardin'
    }, {
      headers: { Cookie: ownerToken }
    });

    if (property2Response.data.success) {
      propertyId2 = property2Response.data.data.property.id;
      console.log(`✅ Propriété 2 créée: ${property2Response.data.data.property.name}`);
    }

    console.log('\n---\n');

    // 5. Création de plusieurs accès (valides et expirés)
    console.log('5️⃣ Création de 5 accès différents:');
    
    // Accès 1 - VALIDE - Expire bientôt (urgent)
    const access1Response = await axios.post(`${BASE_URL}/access`, {
      propertyId: propertyId1,
      userId: targetUserId,
      startDate: '2025-08-01T09:00:00.000Z',
      endDate: '2025-08-03T17:00:00.000Z', // Expire bientôt
      accessType: 'TEMPORARY',
      description: 'Accès urgent - femme de ménage'
    }, {
      headers: { Cookie: ownerToken }
    });

    if (access1Response.data.success) {
      createdAccessIds.push(access1Response.data.data.access.id);
      console.log(`✅ Accès 1 créé - URGENT (expire 03/08) - Code: ${access1Response.data.data.access.code}`);
    }

    await new Promise(resolve => setTimeout(resolve, 100));

    // Accès 2 - VALIDE - Expire plus tard
    const access2Response = await axios.post(`${BASE_URL}/access`, {
      propertyId: propertyId1,
      userId: targetUserId,
      startDate: '2025-08-01T00:00:00.000Z',
      endDate: '2025-12-31T23:59:59.000Z', // Expire tard
      accessType: 'PERMANENT',
      description: 'Accès locataire principal'
    }, {
      headers: { Cookie: ownerToken }
    });

    if (access2Response.data.success) {
      createdAccessIds.push(access2Response.data.data.access.id);
      console.log(`✅ Accès 2 créé - LONG TERME (expire 31/12) - Code: ${access2Response.data.data.access.code}`);
    }

    await new Promise(resolve => setTimeout(resolve, 100));

    // Accès 3 - VALIDE - Expire entre les deux
    const access3Response = await axios.post(`${BASE_URL}/access`, {
      propertyId: propertyId2,
      userId: targetUserId,
      startDate: '2025-08-01T08:00:00.000Z',
      endDate: '2025-09-15T20:00:00.000Z', // Expire en milieu
      accessType: 'TEMPORARY',
      description: 'Accès maison de campagne'
    }, {
      headers: { Cookie: ownerToken }
    });

    if (access3Response.data.success) {
      createdAccessIds.push(access3Response.data.data.access.id);
      console.log(`✅ Accès 3 créé - MOYEN TERME (expire 15/09) - Code: ${access3Response.data.data.access.code}`);
    }

    await new Promise(resolve => setTimeout(resolve, 100));

    // Accès 4 - EXPIRÉ (ne devrait pas apparaître)
    try {
      const expiredAccessResponse = await axios.post(`${BASE_URL}/access`, {
        propertyId: propertyId1,
        userId: targetUserId,
        startDate: '2024-01-01T09:00:00.000Z',
        endDate: '2024-12-31T17:00:00.000Z', // Déjà expiré
        accessType: 'TEMPORARY',
        description: 'Accès expiré (ne devrait pas apparaître)'
      }, {
        headers: { Cookie: ownerToken }
      });
      console.log('⚠️ Accès expiré créé manuellement (test)');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Accès expiré correctement rejeté par la validation');
      }
    }

    console.log('\n---\n');

    // 6. Test sans token (devrait échouer)
    console.log('6️⃣ Test récupération sans token (devrait échouer):');
    try {
      await axios.get(`${BASE_URL}/access/my-accesses`);
      console.log('❌ Problème: Devrait échouer sans token!');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log(`✅ Route protégée - Erreur attendue: ${error.response.data.message}`);
      } else {
        console.log('❌ Erreur inattendue:', error.message);
      }
    }

    console.log('\n---\n');

    // 7. Récupération de mes accès (utilisateur cible)
    console.log('7️⃣ Récupération de tous mes accès actifs:');
    const myAccessesResponse = await axios.get(`${BASE_URL}/access/my-accesses`, {
      headers: { Cookie: targetUserToken }
    });

    if (myAccessesResponse.data.success) {
      const accesses = myAccessesResponse.data.data.accesses;
      console.log(`✅ ${accesses.length} accès actifs récupérés!`);
      console.log(`📄 Message: ${myAccessesResponse.data.message}`);
      
      console.log('\n📋 Mes accès (triés par urgence - expire bientôt en premier):');
      accesses.forEach((access, index) => {
        console.log(`\n   ${index + 1}. Accès ${access.accessType}:`);
        console.log(`      🆔 ID: ${access.id}`);
        console.log(`      🔑 Code: ${access.code} (${access.code.length} chiffres)`);
        console.log(`      🏠 Propriété: ${access.property.name}`);
        console.log(`      📍 Adresse: ${access.property.address}`);
        console.log(`      📅 Période: ${new Date(access.startDate).toLocaleDateString()} - ${new Date(access.endDate).toLocaleDateString()}`);
        console.log(`      📝 Description: ${access.description}`);
        console.log(`      ⏰ Expire le: ${new Date(access.endDate).toLocaleString()}`);
        
        // Calculer les jours restants
        const now = new Date();
        const endDate = new Date(access.endDate);
        const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
        console.log(`      ⏳ Plus que ${daysLeft} jour(s)`);
      });

      // Vérifier l'ordre de tri (par endDate croissante)
      if (accesses.length > 1) {
        const isCorrectOrder = new Date(accesses[0].endDate) <= new Date(accesses[1].endDate);
        console.log(`\n   ✅ Tri par urgence: ${isCorrectOrder ? 'CORRECT (expire bientôt en premier)' : 'INCORRECT'}`);
      }
    }

    console.log('\n---\n');

    // 8. Vérification du filtrage (seulement actifs et non expirés)  
    console.log('8️⃣ Vérification du filtrage:');
    if (myAccessesResponse.data.success) {
      const accesses = myAccessesResponse.data.data.accesses;
      const now = new Date();
      
      let allActive = true;
      let allValid = true;
      
      accesses.forEach(access => {
        if (!access.isActive) allActive = false;
        if (new Date(access.endDate) <= now) allValid = false;
      });
      
      console.log(`✅ Tous actifs (isActive=true): ${allActive ? 'OUI' : 'NON'}`);
      console.log(`✅ Tous valides (endDate > now): ${allValid ? 'OUI' : 'NON'}`);
      console.log(`📊 Filtrage validé: ${allActive && allValid ? 'CONFORME' : 'NON CONFORME'}`);
    }

    console.log('\n---\n');

    // 9. Vérification du format de réponse
    console.log('9️⃣ Vérification du format de réponse:');
    if (myAccessesResponse.data.success) {
      const accesses = myAccessesResponse.data.data.accesses;
      if (accesses.length > 0) {
        const firstAccess = accesses[0];
        
        const requiredFields = ['id', 'accessType', 'code', 'startDate', 'endDate', 'description', 'property'];
        const propertyFields = ['name', 'address'];
        
        const hasAllFields = requiredFields.every(field => firstAccess.hasOwnProperty(field));
        const hasAllPropertyFields = propertyFields.every(field => firstAccess.property.hasOwnProperty(field));
        
        console.log(`✅ Format accès complet: ${hasAllFields ? 'OUI' : 'NON'}`);
        console.log(`✅ Format propriété complet: ${hasAllPropertyFields ? 'OUI' : 'NON'}`);
        console.log(`📊 Structure validée: ${hasAllFields && hasAllPropertyFields ? 'CONFORME' : 'NON CONFORME'}`);
      }
    }

    console.log('\n---\n');

    // 10. Test d'un utilisateur sans accès
    console.log('🔟 Test utilisateur propriétaire (sans accès reçus):');
    const ownerAccessesResponse = await axios.get(`${BASE_URL}/access/my-accesses`, {
      headers: { Cookie: ownerToken }
    });

    if (ownerAccessesResponse.data.success) {
      console.log(`✅ Accès du propriétaire: ${ownerAccessesResponse.data.data.accesses.length} accès`);
      console.log(`📄 Message: ${ownerAccessesResponse.data.message}`);
      console.log(`📊 Logique: Le propriétaire ne reçoit pas d'accès, il en donne`);
    }

    console.log('\n🎯 Test de récupération de mes accès terminé !');

  } catch (error) {
    console.error('❌ Erreur dans le test:', error.response?.data || error.message);
  }
}

// Exécuter le test
testGetUserAccesses(); 