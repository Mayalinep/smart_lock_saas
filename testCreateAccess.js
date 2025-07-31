const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testCreateAccess() {
  console.log('✏️ === Test Création d\'Accès Digital ===\n');

  let ownerToken;
  let targetUserToken;
  let propertyId;
  let targetUserId;

  try {
    // 1. Création d'un utilisateur cible (qui recevra l'accès)
    console.log('1️⃣ Création d\'un utilisateur cible:');
    
    const targetUser = {
      email: 'target.user@example.com',
      password: 'TargetPass123!',
      firstName: 'Target',
      lastName: 'User'
    };

    try {
      const registerResponse = await axios.post(`${BASE_URL}/auth/register`, targetUser);
      if (registerResponse.data.success) {
        targetUserId = registerResponse.data.data.user.id;
        console.log(`✅ Utilisateur cible créé: ${targetUserId}`);
        console.log(`📧 Email: ${targetUser.email}`);
      }
    } catch (registerError) {
      // Si l'utilisateur existe déjà, se connecter
      if (registerError.response?.status === 409) {
        console.log('📝 Utilisateur cible existe déjà, connexion...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
          email: targetUser.email,
          password: targetUser.password
        });
        if (loginResponse.data.success) {
          targetUserId = loginResponse.data.data.user.id;
          console.log(`✅ Connexion utilisateur cible réussie: ${targetUserId}`);
        }
      } else {
        throw registerError;
      }
    }

    console.log('\n---\n');

    // 2. Connexion propriétaire
    console.log('2️⃣ Connexion du propriétaire:');
    const ownerLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'jane.doe@example.com',
      password: 'Mot2Passe!'
    });

    if (ownerLoginResponse.data.success) {
      console.log('✅ Connexion propriétaire réussie');
      const cookies = ownerLoginResponse.headers['set-cookie'];
      const tokenCookie = cookies.find(cookie => cookie.startsWith('token='));
      ownerToken = tokenCookie ? tokenCookie.split(';')[0] : null;
      console.log(`🍪 Token propriétaire: ${ownerToken ? 'OUI' : 'NON'}`);
    }

    console.log('\n---\n');

    // 3. Création d'une propriété
    console.log('3️⃣ Création d\'une propriété pour les tests:');
    const createPropertyResponse = await axios.post(`${BASE_URL}/properties`, {
      name: 'Propriété Test Accès',
      address: '123 Rue Test Accès, Ville Digital',
      description: 'Propriété pour tester la création d\'accès'
    }, {
      headers: { Cookie: ownerToken }
    });

    if (createPropertyResponse.data.success) {
      propertyId = createPropertyResponse.data.data.property.id;
      console.log(`✅ Propriété créée: ${propertyId}`);
      console.log(`🏠 Nom: ${createPropertyResponse.data.data.property.name}`);
    }

    console.log('\n---\n');

    // 4. Test sans token (devrait échouer)
    console.log('4️⃣ Test création d\'accès sans token (devrait échouer):');
    try {
      await axios.post(`${BASE_URL}/access`, {
        propertyId,
        userId: targetUserId,
        startDate: '2025-08-05T10:00:00.000Z',
        endDate: '2025-08-15T18:00:00.000Z',
        accessType: 'TEMPORARY',
        description: 'Test sans token'
      });
      console.log('❌ Problème: La création devrait échouer sans token!');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log(`✅ Route protégée - Erreur attendue: ${error.response.data.message}`);
      } else {
        console.log('❌ Erreur inattendue:', error.message);
      }
    }

    console.log('\n---\n');

    // 5. Test avec données manquantes
    console.log('5️⃣ Test avec données manquantes (devrait échouer):');
    try {
      await axios.post(`${BASE_URL}/access`, {
        propertyId,
        // userId manquant
        startDate: '2025-08-05T10:00:00.000Z',
        endDate: '2025-08-15T18:00:00.000Z',
        accessType: 'TEMPORARY'
      }, {
        headers: { Cookie: ownerToken }
      });
      console.log('❌ Problème: Devrait échouer avec des données manquantes!');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log(`✅ Validation réussie - Erreur attendue: ${error.response.data.message}`);
      } else {
        console.log('❌ Erreur inattendue:', error.message);
      }
    }

    console.log('\n---\n');

    // 6. Test avec propriété inexistante
    console.log('6️⃣ Test avec propriété inexistante (devrait échouer):');
    try {
      await axios.post(`${BASE_URL}/access`, {
        propertyId: 'property-inexistante-123',
        userId: targetUserId,
        startDate: '2025-08-05T10:00:00.000Z',
        endDate: '2025-08-15T18:00:00.000Z',
        accessType: 'TEMPORARY',
        description: 'Test propriété inexistante'
      }, {
        headers: { Cookie: ownerToken }
      });
      console.log('❌ Problème: Devrait échouer avec une propriété inexistante!');
    } catch (error) {
      if (error.response && error.response.status === 403) {
        console.log(`✅ Propriété inexistante rejetée - Erreur attendue: ${error.response.data.message}`);
      } else {
        console.log('❌ Erreur inattendue:', error.message);
      }
    }

    console.log('\n---\n');

    // 7. Test avec utilisateur inexistant
    console.log('7️⃣ Test avec utilisateur cible inexistant (devrait échouer):');
    try {
      await axios.post(`${BASE_URL}/access`, {
        propertyId,
        userId: 'user-inexistant-123',
        startDate: '2025-08-05T10:00:00.000Z',
        endDate: '2025-08-15T18:00:00.000Z',
        accessType: 'TEMPORARY',
        description: 'Test utilisateur inexistant'
      }, {
        headers: { Cookie: ownerToken }
      });
      console.log('❌ Problème: Devrait échouer avec un utilisateur inexistant!');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log(`✅ Utilisateur inexistant rejeté - Erreur attendue: ${error.response.data.message}`);
      } else {
        console.log('❌ Erreur inattendue:', error.message);
      }
    }

    console.log('\n---\n');

    // 8. Test avec dates invalides (startDate >= endDate)
    console.log('8️⃣ Test avec dates invalides - startDate >= endDate (devrait échouer):');
    try {
      await axios.post(`${BASE_URL}/access`, {
        propertyId,
        userId: targetUserId,
        startDate: '2025-08-15T10:00:00.000Z',
        endDate: '2025-08-10T18:00:00.000Z', // Date de fin avant le début
        accessType: 'TEMPORARY',
        description: 'Test dates invalides'
      }, {
        headers: { Cookie: ownerToken }
      });
      console.log('❌ Problème: Devrait échouer avec des dates invalides!');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log(`✅ Dates invalides rejetées - Erreur attendue: ${error.response.data.message}`);
      } else {
        console.log('❌ Erreur inattendue:', error.message);
      }
    }

    console.log('\n---\n');

    // 9. Test avec date dans le passé
    console.log('9️⃣ Test avec date de début dans le passé (devrait échouer):');
    try {
      await axios.post(`${BASE_URL}/access`, {
        propertyId,
        userId: targetUserId,
        startDate: '2024-01-01T10:00:00.000Z', // Date dans le passé
        endDate: '2025-08-15T18:00:00.000Z',
        accessType: 'TEMPORARY',
        description: 'Test date passée'
      }, {
        headers: { Cookie: ownerToken }
      });
      console.log('❌ Problème: Devrait échouer avec une date dans le passé!');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log(`✅ Date passée rejetée - Erreur attendue: ${error.response.data.message}`);
      } else {
        console.log('❌ Erreur inattendue:', error.message);
      }
    }

    console.log('\n---\n');

    // 10. Création d'accès réussie - TEMPORARY
    console.log('🔟 Création d\'accès TEMPORARY réussie:');
    const tempAccessResponse = await axios.post(`${BASE_URL}/access`, {
      propertyId,
      userId: targetUserId,
      startDate: '2025-08-05T10:00:00.000Z',
      endDate: '2025-08-15T18:00:00.000Z',
      accessType: 'TEMPORARY',
      description: 'Accès temporaire pour femme de ménage'
    }, {
      headers: { Cookie: ownerToken }
    });

    if (tempAccessResponse.data.success) {
      const access = tempAccessResponse.data.data.access;
      console.log('✅ Accès TEMPORARY créé avec succès!');
      console.log(`🆔 ID Accès: ${access.id}`);
      console.log(`🔑 Code: ${access.code} (${access.code.length} chiffres)`);
      console.log(`👤 Utilisateur: ${access.user.firstName} ${access.user.lastName} (${access.user.email})`);
      console.log(`🏠 Propriété: ${access.property.name}`);
      console.log(`📅 Période: ${new Date(access.startDate).toLocaleDateString()} - ${new Date(access.endDate).toLocaleDateString()}`);
      console.log(`📝 Description: ${access.description}`);
      console.log(`📊 Statut: ${access.isActive ? 'ACTIF' : 'INACTIF'}`);
    }

    console.log('\n---\n');

    // 11. Création d'accès réussie - PERMANENT
    console.log('1️⃣1️⃣ Création d\'accès PERMANENT réussie:');
    const permAccessResponse = await axios.post(`${BASE_URL}/access`, {
      propertyId,
      userId: targetUserId,
      startDate: '2025-08-01T00:00:00.000Z',
      endDate: '2025-12-31T23:59:59.000Z',
      accessType: 'PERMANENT',
      description: 'Accès permanent pour locataire'
    }, {
      headers: { Cookie: ownerToken }
    });

    if (permAccessResponse.data.success) {
      const access = permAccessResponse.data.data.access;
      console.log('✅ Accès PERMANENT créé avec succès!');
      console.log(`🆔 ID Accès: ${access.id}`);
      console.log(`🔑 Code: ${access.code} (${access.code.length} chiffres)`);
      console.log(`👤 Utilisateur: ${access.user.firstName} ${access.user.lastName}`);
      console.log(`🏠 Propriété: ${access.property.name}`);
      console.log(`📅 Période: ${new Date(access.startDate).toLocaleDateString()} - ${new Date(access.endDate).toLocaleDateString()}`);
      console.log(`📝 Description: ${access.description}`);
      console.log(`📊 Statut: ${access.isActive ? 'ACTIF' : 'INACTIF'}`);
    }

    console.log('\n---\n');

    // 12. Test: Propriétaire ne peut pas se donner accès
    console.log('1️⃣2️⃣ Test: Propriétaire ne peut pas se donner accès (devrait échouer):');
    try {
      const ownerUserId = ownerLoginResponse.data.data.user.id;
      await axios.post(`${BASE_URL}/access`, {
        propertyId,
        userId: ownerUserId, // Le propriétaire essaie de se donner accès
        startDate: '2025-08-05T10:00:00.000Z',
        endDate: '2025-08-15T18:00:00.000Z',
        accessType: 'TEMPORARY',
        description: 'Auto-accès propriétaire'
      }, {
        headers: { Cookie: ownerToken }
      });
      console.log('❌ Problème: Le propriétaire ne devrait pas pouvoir se donner accès!');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log(`✅ Auto-accès rejeté - Erreur attendue: ${error.response.data.message}`);
      } else {
        console.log('❌ Erreur inattendue:', error.message);
      }
    }

    console.log('\n🎯 Test de création d\'accès terminé !');

  } catch (error) {
    console.error('❌ Erreur dans le test:', error.response?.data || error.message);
  }
}

// Exécuter le test
testCreateAccess(); 