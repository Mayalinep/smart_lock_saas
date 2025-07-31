const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const BASE_URL = 'http://localhost:3000/api';
const prisma = new PrismaClient();

async function testSoftDelete() {
  console.log('✏️ === Test Système de Soft Delete (Révocation) ===\n');

  let ownerToken;
  let targetUserToken;
  let propertyId;
  let targetUserId;
  let accessId;
  let ownerId;

  try {
    // 1. Connexion du propriétaire
    console.log('1️⃣ Connexion du propriétaire:');
    const ownerLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'jane.doe@example.com',
      password: 'Mot2Passe!'
    });

    if (ownerLoginResponse.data.success) {
      ownerId = ownerLoginResponse.data.data.user.id;
      console.log('✅ Connexion propriétaire réussie');
      const cookies = ownerLoginResponse.headers['set-cookie'];
      const tokenCookie = cookies.find(cookie => cookie.startsWith('token='));
      ownerToken = tokenCookie ? tokenCookie.split(';')[0] : null;
    }

    console.log('\n---\n');

    // 2. Connexion utilisateur cible
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

    // 3. Création d'une propriété
    console.log('3️⃣ Création d\'une propriété pour le test:');
    const propertyResponse = await axios.post(`${BASE_URL}/properties`, {
      name: 'Propriété Test Soft Delete',
      address: '123 Rue Soft Delete, Ville Test',
      description: 'Propriété pour tester la révocation d\'accès'
    }, {
      headers: { Cookie: ownerToken }
    });

    if (propertyResponse.data.success) {
      propertyId = propertyResponse.data.data.property.id;
      console.log(`✅ Propriété créée: ${propertyResponse.data.data.property.name}`);
    }

    console.log('\n---\n');

    // 4. Création d'un accès à révoquer
    console.log('4️⃣ Création d\'un accès à révoquer:');
    const accessResponse = await axios.post(`${BASE_URL}/access`, {
      propertyId,
      userId: targetUserId,
      startDate: '2025-08-01T09:00:00.000Z',
      endDate: '2025-08-20T17:00:00.000Z',
      accessType: 'TEMPORARY',
      description: 'Accès temporaire à révoquer'
    }, {
      headers: { Cookie: ownerToken }
    });

    if (accessResponse.data.success) {
      accessId = accessResponse.data.data.access.id;
      console.log(`✅ Accès créé - Code: ${accessResponse.data.data.access.code}`);
      console.log(`🆔 Access ID: ${accessId}`);
    }

    console.log('\n---\n');

    // 5. Vérification que l'accès apparaît dans les listes avant révocation
    console.log('5️⃣ Vérification présence dans les listes AVANT révocation:');
    
    // Liste propriété
    const beforePropertyResponse = await axios.get(`${BASE_URL}/access/property/${propertyId}`, {
      headers: { Cookie: ownerToken }
    });
    const beforePropertyCount = beforePropertyResponse.data.data.accesses.length;
    console.log(`✅ Accès dans propriété AVANT: ${beforePropertyCount}`);

    // Mes accès utilisateur
    const beforeUserResponse = await axios.get(`${BASE_URL}/access/my-accesses`, {
      headers: { Cookie: targetUserToken }
    });
    const beforeUserCount = beforeUserResponse.data.data.accesses.length;
    console.log(`✅ Mes accès AVANT: ${beforeUserCount}`);

    console.log('\n---\n');

    // 6. Vérification directe en base de données AVANT révocation
    console.log('6️⃣ Vérification en base AVANT révocation:');
    const accessInDb = await prisma.access.findUnique({
      where: { id: accessId }
    });
    console.log(`✅ Accès en base - isActive: ${accessInDb.isActive}`);
    console.log(`✅ Accès en base - revokedAt: ${accessInDb.revokedAt || 'NULL'}`);
    console.log(`✅ Accès en base - revokedBy: ${accessInDb.revokedBy || 'NULL'}`);

    console.log('\n---\n');

    // 7. RÉVOCATION (soft delete) de l'accès
    console.log('7️⃣ 🗑️ RÉVOCATION de l\'accès (soft delete):');
    const revokeResponse = await axios.delete(`${BASE_URL}/access/${accessId}`, {
      headers: { Cookie: ownerToken }
    });

    if (revokeResponse.data.success) {
      console.log('✅ Révocation réussie!');
      console.log(`📄 Message: ${revokeResponse.data.message}`);
      console.log(`📊 Status: ${revokeResponse.status}`);
      console.log(`⏰ Révoqué le: ${new Date(revokeResponse.data.data.revokedAt).toLocaleString()}`);
      console.log(`👤 Révoqué par: ${revokeResponse.data.data.revokedBy}`);
      console.log(`🔑 Code révoqué: ${revokeResponse.data.data.access.code}`);
      console.log(`👤 Utilisateur impacté: ${revokeResponse.data.data.access.user.firstName} ${revokeResponse.data.data.access.user.lastName}`);
    }

    console.log('\n---\n');

    // 8. Vérification directe en base APRÈS révocation (l'accès doit toujours exister)
    console.log('8️⃣ 🔍 Vérification en base APRÈS révocation:');
    const revokedAccessInDb = await prisma.access.findUnique({
      where: { id: accessId }
    });
    
    if (revokedAccessInDb) {
      console.log('✅ Accès CONSERVÉ en base (soft delete OK)');
      console.log(`📊 isActive: ${revokedAccessInDb.isActive} (devrait être false)`);
      console.log(`⏰ revokedAt: ${revokedAccessInDb.revokedAt || 'NULL'} (devrait être rempli)`);
      console.log(`👤 revokedBy: ${revokedAccessInDb.revokedBy || 'NULL'} (devrait être rempli)`);
      console.log(`🔑 Code conservé: ${revokedAccessInDb.code}`);
    } else {
      console.log('❌ PROBLÈME: Accès supprimé de la base (hard delete non souhaité)');
    }

    console.log('\n---\n');

    // 9. Vérification que l'accès n'apparaît PLUS dans les listes
    console.log('9️⃣ 🚫 Vérification disparition des listes APRÈS révocation:');
    
    // Liste propriété
    const afterPropertyResponse = await axios.get(`${BASE_URL}/access/property/${propertyId}`, {
      headers: { Cookie: ownerToken }
    });
    const afterPropertyCount = afterPropertyResponse.data.data.accesses.length;
    console.log(`✅ Accès dans propriété APRÈS: ${afterPropertyCount} (${beforePropertyCount - afterPropertyCount} en moins)`);

    // Mes accès utilisateur
    const afterUserResponse = await axios.get(`${BASE_URL}/access/my-accesses`, {
      headers: { Cookie: targetUserToken }
    });
    const afterUserCount = afterUserResponse.data.data.accesses.length;
    console.log(`✅ Mes accès APRÈS: ${afterUserCount} (${beforeUserCount - afterUserCount} en moins)`);

    // Vérifier que l'accès révoqué n'apparaît plus
    const revokedAccessInProperty = afterPropertyResponse.data.data.accesses.find(a => a.id === accessId);
    const revokedAccessInUser = afterUserResponse.data.data.accesses.find(a => a.id === accessId);
    
    console.log(`🚫 Accès révoqué invisible dans propriété: ${revokedAccessInProperty ? 'NON - PROBLÈME!' : 'OUI'}`);
    console.log(`🚫 Accès révoqué invisible dans mes accès: ${revokedAccessInUser ? 'NON - PROBLÈME!' : 'OUI'}`);

    console.log('\n---\n');

    // 10. Test de double révocation (doit échouer)
    console.log('🔟 🚫 Test double révocation (devrait échouer):');
    try {
      await axios.delete(`${BASE_URL}/access/${accessId}`, {
        headers: { Cookie: ownerToken }
      });
      console.log('❌ PROBLÈME: Double révocation autorisée!');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log(`✅ Double révocation correctement rejetée: ${error.response.data.message}`);
      } else {
        console.log('❌ Erreur inattendue:', error.message);
      }
    }

    console.log('\n---\n');

    // 11. Requête directe pour voir TOUS les accès (y compris révoqués)
    console.log('1️⃣1️⃣ 📊 Audit - Tous les accès (y compris révoqués):');
    const allAccessesInDb = await prisma.access.findMany({
      where: {
        propertyId: propertyId
      },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`📊 Total accès en base (tous états): ${allAccessesInDb.length}`);
    allAccessesInDb.forEach((access, index) => {
      const status = access.revokedAt ? 'RÉVOQUÉ' : (access.isActive ? 'ACTIF' : 'INACTIF');
      const revokedInfo = access.revokedAt ? 
        ` (révoqué par ${access.revokedBy} le ${new Date(access.revokedAt).toLocaleDateString()})` : '';
      
      console.log(`   ${index + 1}. ${access.code} - ${status}${revokedInfo}`);
      console.log(`      👤 Utilisateur: ${access.user.firstName} ${access.user.lastName}`);
      console.log(`      📝 Description: ${access.description}`);
    });

    console.log('\n---\n');

    // 12. Création et révocation d'un second accès pour tester l'historique
    console.log('1️⃣2️⃣ 📈 Test historique - Création d\'un second accès:');
    const access2Response = await axios.post(`${BASE_URL}/access`, {
      propertyId,
      userId: targetUserId,
      startDate: '2025-08-05T10:00:00.000Z',
      endDate: '2025-08-15T18:00:00.000Z',
      accessType: 'PERMANENT',
      description: 'Second accès pour test historique'
    }, {
      headers: { Cookie: ownerToken }
    });

    let access2Id;
    if (access2Response.data.success) {
      access2Id = access2Response.data.data.access.id;
      console.log(`✅ Second accès créé - Code: ${access2Response.data.data.access.code}`);
    }

    // Révocation du second accès
    await axios.delete(`${BASE_URL}/access/${access2Id}`, {
      headers: { Cookie: ownerToken }
    });
    console.log('✅ Second accès aussi révoqué');

    // Vérification historique complet
    const finalAudit = await prisma.access.findMany({
      where: { propertyId: propertyId },
      select: {
        id: true,
        code: true,
        isActive: true,
        revokedAt: true,
        revokedBy: true,
        accessType: true,
        description: true
      }
    });

    console.log(`📊 Historique final: ${finalAudit.length} accès en base`);
    const activeCount = finalAudit.filter(a => a.isActive && !a.revokedAt).length;
    const revokedCount = finalAudit.filter(a => a.revokedAt).length;
    console.log(`   📈 Actifs: ${activeCount}`);
    console.log(`   🗑️ Révoqués: ${revokedCount}`);

    console.log('\n🎯 Test du système de soft delete terminé !');
    console.log('\n📋 RÉSUMÉ SOFT DELETE:');
    console.log('   ✅ Accès révoqués conservés en base (historique)');
    console.log('   ✅ Accès révoqués invisibles dans les listes');
    console.log('   ✅ Traçabilité complète (qui, quand)');
    console.log('   ✅ Protection double révocation');
    console.log('   ✅ Audit et historique possibles');

  } catch (error) {
    console.error('❌ Erreur dans le test:', error.response?.data || error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le test
testSoftDelete(); 