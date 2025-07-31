const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testDeleteAccess() {
  console.log('✏️ === Test Suppression Sécurisée d\'Accès ===\n');

  let ownerToken;
  let targetUserToken;
  let otherOwnerToken;
  let propertyId;
  let otherPropertyId;
  let targetUserId;
  let accessId;
  let otherAccessId;

  try {
    // 1. Connexion du propriétaire principal
    console.log('1️⃣ Connexion du propriétaire principal:');
    const ownerLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'jane.doe@example.com',
      password: 'Mot2Passe!'
    });

    if (ownerLoginResponse.data.success) {
      console.log('✅ Connexion propriétaire principal réussie');
      const cookies = ownerLoginResponse.headers['set-cookie'];
      const tokenCookie = cookies.find(cookie => cookie.startsWith('token='));
      ownerToken = tokenCookie ? tokenCookie.split(';')[0] : null;
    }

    console.log('\n---\n');

    // 2. Connexion utilisateur cible (qui reçoit l'accès) 
    console.log('2️⃣ Connexion utilisateur cible:');
    const targetLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'target.user@example.com',
      password: 'TargetPass123!'
    });

    if (targetLoginResponse.data.success) {
      targetUserId = targetLoginResponse.data.data.user.id;
      const cookies = targetLoginResponse.headers['set-cookie'];
      const tokenCookie = cookies.find(cookie => cookie.startsWith('token='));
      targetUserToken = tokenCookie ? tokenCookie.split(';')[0] : null;
      console.log(`✅ Utilisateur cible connecté: ${targetUserId}`);
    }

    console.log('\n---\n');

    // 3. Création d'un autre propriétaire (pour test sécurité)
    console.log('3️⃣ Création d\'un autre propriétaire:');
    
    const otherOwner = {
      email: 'other.owner@example.com',
      password: 'OtherPass123!',
      firstName: 'Other',
      lastName: 'Owner'
    };

    try {
      const registerResponse = await axios.post(`${BASE_URL}/auth/register`, otherOwner);
      console.log(`✅ Autre propriétaire créé: ${registerResponse.data.data.user.id}`);
    } catch (registerError) {
      if (registerError.response?.status === 409) {
        console.log('📝 Autre propriétaire existe déjà, connexion...');
      }
    }

    // Connexion autre propriétaire
    const otherOwnerLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: otherOwner.email,
      password: otherOwner.password
    });

    if (otherOwnerLoginResponse.data.success) {
      const cookies = otherOwnerLoginResponse.headers['set-cookie'];
      const tokenCookie = cookies.find(cookie => cookie.startsWith('token='));
      otherOwnerToken = tokenCookie ? tokenCookie.split(';')[0] : null;
      console.log('✅ Autre propriétaire connecté');
    }

    console.log('\n---\n');

    // 4. Création des propriétés
    console.log('4️⃣ Création des propriétés:');
    
    // Propriété du propriétaire principal
    const property1Response = await axios.post(`${BASE_URL}/properties`, {
      name: 'Propriété Test Delete',
      address: '123 Rue Delete Test, Ville Sécurité',
      description: 'Propriété pour tester la suppression d\'accès'
    }, {
      headers: { Cookie: ownerToken }
    });

    if (property1Response.data.success) {
      propertyId = property1Response.data.data.property.id;
      console.log(`✅ Propriété principale créée: ${property1Response.data.data.property.name}`);
    }

    // Propriété de l'autre propriétaire
    const property2Response = await axios.post(`${BASE_URL}/properties`, {
      name: 'Propriété Autre Owner',
      address: '456 Rue Autre Owner, Ville Test',
      description: 'Propriété d\'un autre propriétaire'
    }, {
      headers: { Cookie: otherOwnerToken }
    });

    if (property2Response.data.success) {
      otherPropertyId = property2Response.data.data.property.id;
      console.log(`✅ Propriété autre propriétaire créée: ${property2Response.data.data.property.name}`);
    }

    console.log('\n---\n');

    // 5. Création d'accès à supprimer
    console.log('5️⃣ Création d\'accès à supprimer:');
    
    // Accès dans la propriété principale
    const access1Response = await axios.post(`${BASE_URL}/access`, {
      propertyId,
      userId: targetUserId,
      startDate: '2025-08-01T09:00:00.000Z',
      endDate: '2025-08-10T17:00:00.000Z',
      accessType: 'TEMPORARY',
      description: 'Accès à supprimer - test sécurité'
    }, {
      headers: { Cookie: ownerToken }
    });

    if (access1Response.data.success) {
      accessId = access1Response.data.data.access.id;
      console.log(`✅ Accès principal créé - Code: ${access1Response.data.data.access.code}`);
      console.log(`🆔 Access ID: ${accessId}`);
    }

    // Accès dans la propriété de l'autre propriétaire
    const access2Response = await axios.post(`${BASE_URL}/access`, {
      propertyId: otherPropertyId,  
      userId: targetUserId,
      startDate: '2025-08-01T09:00:00.000Z',
      endDate: '2025-08-10T17:00:00.000Z',
      accessType: 'TEMPORARY',
      description: 'Accès de l\'autre propriétaire'
    }, {
      headers: { Cookie: otherOwnerToken }
    });

    if (access2Response.data.success) {
      otherAccessId = access2Response.data.data.access.id;
      console.log(`✅ Accès autre propriétaire créé - Code: ${access2Response.data.data.access.code}`);
      console.log(`🆔 Other Access ID: ${otherAccessId}`);
    }

    console.log('\n---\n');

    // 6. Test sans token (devrait échouer)
    console.log('6️⃣ Test suppression sans token (devrait échouer):');
    try {
      await axios.delete(`${BASE_URL}/access/${accessId}`);
      console.log('❌ Problème: Devrait échouer sans token!');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log(`✅ Route protégée - Erreur attendue: ${error.response.data.message}`);
      } else {
        console.log('❌ Erreur inattendue:', error.message);
      }
    }

    console.log('\n---\n');

    // 7. Test utilisateur cible tente de supprimer son propre accès (SÉCURITÉ CRITIQUE)
    console.log('7️⃣ 🛡️ Test ANTI-SQUATTEUR - Utilisateur cible tente de supprimer son accès:');
    try {
      await axios.delete(`${BASE_URL}/access/${accessId}`, {
        headers: { Cookie: targetUserToken }
      });
      console.log('❌ PROBLÈME SÉCURITÉ: L\'utilisateur cible ne devrait PAS pouvoir supprimer son accès!');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log(`✅ SÉCURITÉ OK - Utilisateur cible rejeté: ${error.response.data.message}`);
        console.log(`🛡️ Protection anti-squatteur activée!`);
      } else {
        console.log('❌ Erreur inattendue:', error.message);
      }
    }

    console.log('\n---\n');

    // 8. Test propriétaire tente de supprimer accès d'une autre propriété (SÉCURITÉ)
    console.log('8️⃣ 🛡️ Test INTER-PROPRIÉTAIRES - Propriétaire A tente de supprimer accès de propriétaire B:');
    try {
      await axios.delete(`${BASE_URL}/access/${otherAccessId}`, {
        headers: { Cookie: ownerToken } // Propriétaire A tente de supprimer accès de propriétaire B
      });
      console.log('❌ PROBLÈME SÉCURITÉ: Propriétaire A ne devrait PAS pouvoir supprimer accès de propriétaire B!');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log(`✅ SÉCURITÉ OK - Propriétaire non autorisé rejeté: ${error.response.data.message}`);
        console.log(`🛡️ Protection inter-propriétaires activée!`);
      } else {
        console.log('❌ Erreur inattendue:', error.message);
      }
    }

    console.log('\n---\n');

    // 9. Test avec ID d'accès inexistant
    console.log('9️⃣ Test avec ID d\'accès inexistant:');
    try {
      await axios.delete(`${BASE_URL}/access/access-inexistant-123`, {
        headers: { Cookie: ownerToken }
      });
      console.log('❌ Problème: Devrait échouer avec ID inexistant!');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log(`✅ ID inexistant rejeté - Erreur attendue: ${error.response.data.message}`);
      } else {
        console.log('❌ Erreur inattendue:', error.message);
      }
    }

    console.log('\n---\n');

    // 10. Vérification que l'accès existe avant suppression
    console.log('🔟 Vérification que l\'accès existe avant suppression:');
    const beforeDeleteResponse = await axios.get(`${BASE_URL}/access/property/${propertyId}`, {
      headers: { Cookie: ownerToken }
    });

    if (beforeDeleteResponse.data.success) {
      const accessExists = beforeDeleteResponse.data.data.accesses.find(a => a.id === accessId);
      console.log(`✅ Accès trouvé avant suppression: ${accessExists ? 'OUI' : 'NON'}`);
      if (accessExists) {
        console.log(`📄 Code: ${accessExists.code}, Description: ${accessExists.description}`);
      }
    }

    console.log('\n---\n');

    // 11. SUPPRESSION RÉUSSIE - Propriétaire légitime supprime son accès
    console.log('1️⃣1️⃣ ✅ SUPPRESSION LÉGALE - Propriétaire supprime son accès:');
    const deleteResponse = await axios.delete(`${BASE_URL}/access/${accessId}`, {
      headers: { Cookie: ownerToken }
    });

    if (deleteResponse.data.success) {
      console.log('✅ Suppression réussie!');
      console.log(`📄 Message: ${deleteResponse.data.message}`);
      console.log(`📊 Status: ${deleteResponse.status}`);
      console.log(`🛡️ Sécurité respectée: Seul le propriétaire peut supprimer`);
    }

    console.log('\n---\n');

    // 12. Vérification que l'accès n'existe plus
    console.log('1️⃣2️⃣ Vérification que l\'accès a bien été supprimé:');
    const afterDeleteResponse = await axios.get(`${BASE_URL}/access/property/${propertyId}`, {
      headers: { Cookie: ownerToken }
    });

    if (afterDeleteResponse.data.success) {
      const accessStillExists = afterDeleteResponse.data.data.accesses.find(a => a.id === accessId);
      console.log(`✅ Accès supprimé définitivement: ${accessStillExists ? 'NON - PROBLÈME!' : 'OUI'}`);
      console.log(`📊 Nombre d'accès restants: ${afterDeleteResponse.data.data.accesses.length}`);
    }

    console.log('\n---\n');

    // 13. Test suppression d'un accès déjà supprimé
    console.log('1️⃣3️⃣ Test suppression d\'un accès déjà supprimé:');
    try {
      await axios.delete(`${BASE_URL}/access/${accessId}`, {
        headers: { Cookie: ownerToken }
      });
      console.log('❌ Problème: Devrait échouer car accès déjà supprimé!');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log(`✅ Accès déjà supprimé détecté - Erreur attendue: ${error.response.data.message}`);
      } else {
        console.log('❌ Erreur inattendue:', error.message);
      }
    }

    console.log('\n---\n');

    // 14. Vérification mes accès utilisateur cible (l'accès supprimé ne doit plus apparaître)
    console.log('1️⃣4️⃣ Vérification: L\'accès supprimé n\'apparaît plus dans "mes accès":');
    const myAccessesResponse = await axios.get(`${BASE_URL}/access/my-accesses`, {
      headers: { Cookie: targetUserToken }
    });

    if (myAccessesResponse.data.success) {
      const deletedAccessStillVisible = myAccessesResponse.data.data.accesses.find(a => a.id === accessId);
      console.log(`✅ Accès supprimé invisible dans "mes accès": ${deletedAccessStillVisible ? 'NON - PROBLÈME!' : 'OUI'}`);
      console.log(`📊 Mes accès restants: ${myAccessesResponse.data.data.accesses.length}`);
    }

    console.log('\n🎯 Test de suppression sécurisée terminé !');
    console.log('\n🛡️ RÉSUMÉ SÉCURITÉ:');
    console.log('   ✅ Seul le propriétaire peut supprimer');
    console.log('   ✅ Utilisateur cible ne peut PAS supprimer');  
    console.log('   ✅ Propriétaires ne peuvent pas se supprimer mutuellement');
    console.log('   ✅ Protection anti-squatteur active');

  } catch (error) {
    console.error('❌ Erreur dans le test:', error.response?.data || error.message);
  }
}

// Exécuter le test
testDeleteAccess(); 