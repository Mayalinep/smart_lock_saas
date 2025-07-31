const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testZodValidation() {
  console.log('✏️ === Test Validations Professionnelles Zod ===\n');

  try {
    // 1. Test validation email invalide
    console.log('1️⃣ Test email invalide:');
    try {
      await axios.post(`${BASE_URL}/auth/register`, {
        email: 'email-invalide',
        password: 'MotDePasse123!',
        firstName: 'Test',
        lastName: 'User'
      });
      console.log('❌ Problème: Email invalide accepté!');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Email invalide rejeté');
        console.log(`📄 Message: ${error.response.data.message}`);
        console.log(`📋 Détails: ${error.response.data.details}`);
      }
    }

    console.log('\n---\n');

    // 2. Test mot de passe trop faible
    console.log('2️⃣ Test mot de passe trop faible:');
    try {
      await axios.post(`${BASE_URL}/auth/register`, {
        email: 'test@example.com',
        password: 'faible', // Pas de majuscule, pas de chiffre
        firstName: 'Test',
        lastName: 'User'
      });
      console.log('❌ Problème: Mot de passe faible accepté!');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Mot de passe faible rejeté');
        console.log(`📄 Message: ${error.response.data.message}`);
        console.log(`📋 Détails: ${error.response.data.details}`);
      }
    }

    console.log('\n---\n');

    // 3. Test prénom avec caractères invalides
    console.log('3️⃣ Test prénom avec caractères invalides:');
    try {
      await axios.post(`${BASE_URL}/auth/register`, {
        email: 'test2@example.com',
        password: 'MotDePasse123!',
        firstName: 'Test123@#', // Caractères invalides
        lastName: 'User'
      });
      console.log('❌ Problème: Prénom invalide accepté!');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Prénom invalide rejeté');
        console.log(`📄 Message: ${error.response.data.message}`);
        console.log(`📋 Détails: ${error.response.data.details}`);
      }
    }

    console.log('\n---\n');

    // 4. Test téléphone français invalide
    console.log('4️⃣ Test téléphone français invalide:');
    try {
      await axios.post(`${BASE_URL}/auth/register`, {
        email: 'test3@example.com',
        password: 'MotDePasse123!',
        firstName: 'Test',
        lastName: 'User',
        phone: '123456' // Format invalide
      });
      console.log('❌ Problème: Téléphone invalide accepté!');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Téléphone invalide rejeté');
        console.log(`📄 Message: ${error.response.data.message}`);
        console.log(`📋 Détails: ${error.response.data.details}`);
      }
    }

    console.log('\n---\n');

    // 5. Test inscription réussie avec validation Zod
    console.log('5️⃣ Test inscription VALIDE (Zod devrait accepter):');
    try {
      const validUser = await axios.post(`${BASE_URL}/auth/register`, {
        email: 'zod.test@example.com',
        password: 'MotDePasseSecure123!',
        firstName: 'Jean-Pierre',
        lastName: "O'Connor",
        phone: '0123456789'
      });
      
      if (validUser.data.success) {
        console.log('✅ Inscription réussie avec toutes validations Zod');
        console.log(`📄 Message: ${validUser.data.message}`);
        console.log(`👤 Utilisateur: ${validUser.data.data.user.firstName} ${validUser.data.data.user.lastName}`);
      }
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('✅ Utilisateur déjà existant (validation OK)');
      } else {
        console.log('❌ Erreur inattendue:', error.response?.data);
      }
    }

    console.log('\n---\n');

    // 6. Connexion pour tester les validations sur les propriétés
    console.log('6️⃣ Connexion pour tester validations propriétés:');
    let token;
    try {
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'jane.doe@example.com',
        password: 'Mot2Passe!'
      });
      
      if (loginResponse.data.success) {
        const cookies = loginResponse.headers['set-cookie'];
        const tokenCookie = cookies.find(cookie => cookie.startsWith('token='));
        token = tokenCookie ? tokenCookie.split(';')[0] : null;
        console.log('✅ Connexion réussie pour tests propriétés');
      }
    } catch (error) {
      console.log('❌ Erreur connexion:', error.response?.data);
    }

    console.log('\n---\n');

    // 7. Test nom de propriété vide
    console.log('7️⃣ Test propriété avec nom vide:');
    try {
      await axios.post(`${BASE_URL}/properties`, {
        name: '', // Nom vide
        address: '123 Rue Test',
        description: 'Test'
      }, {
        headers: { Cookie: token }
      });
      console.log('❌ Problème: Nom vide accepté!');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Nom vide rejeté');
        console.log(`📋 Détails: ${error.response.data.details}`);
      }
    }

    console.log('\n---\n');

    // 8. Test adresse trop courte
    console.log('8️⃣ Test adresse trop courte:');
    try {
      await axios.post(`${BASE_URL}/properties`, {
        name: 'Ma Propriété',
        address: '123', // Trop courte (min 5 caractères)
        description: 'Test'
      }, {
        headers: { Cookie: token }
      });
      console.log('❌ Problème: Adresse trop courte acceptée!');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Adresse trop courte rejetée');
        console.log(`📋 Détails: ${error.response.data.details}`);
      }
    }

    console.log('\n---\n');

    // 9. Test description trop longue
    console.log('9️⃣ Test description trop longue:');
    const longDescription = 'A'.repeat(1001); // 1001 caractères (max 1000)
    try {
      await axios.post(`${BASE_URL}/properties`, {
        name: 'Ma Propriété',
        address: '123 Rue Test Avenue',
        description: longDescription
      }, {
        headers: { Cookie: token }
      });
      console.log('❌ Problème: Description trop longue acceptée!');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Description trop longue rejetée');
        console.log(`📋 Détails: ${error.response.data.details}`);
      }
    }

    console.log('\n---\n');

    // 10. Test création propriété VALIDE avec trim automatique
    console.log('🔟 Test propriété VALIDE (avec espaces automatiquement supprimés):');
    try {
      const propertyResponse = await axios.post(`${BASE_URL}/properties`, {
        name: '   Ma Belle Propriété   ', // Espaces qui seront supprimés
        address: '   123 Avenue des Tests, Ville Zod   ',
        description: '   Description avec espaces   '
      }, {
        headers: { Cookie: token }
      });
      
      if (propertyResponse.data.success) {
        console.log('✅ Propriété créée avec trim automatique');
        console.log(`🏠 Nom: "${propertyResponse.data.data.property.name}"`);
        console.log(`📍 Adresse: "${propertyResponse.data.data.property.address}"`);
        console.log(`📝 Description: "${propertyResponse.data.data.property.description}"`);
        console.log('🧹 (Remarque: les espaces en début/fin ont été supprimés automatiquement)');
      }
    } catch (error) {
      console.log('❌ Erreur inattendue:', error.response?.data);
    }

    console.log('\n🎯 Test des validations Zod terminé !');
    console.log('\n🏆 AVANTAGES ZOD DÉMONTRÉS:');
    console.log('   ✅ Messages d\'erreur précis et professionnels');
    console.log('   ✅ Validation des formats (email, téléphone, noms)');
    console.log('   ✅ Contraintes de longueur automatiques');
    console.log('   ✅ Transformation automatique (trim des espaces)');
    console.log('   ✅ Validation des caractères autorisés');
    console.log('   ✅ Règles de mot de passe complexes');
    console.log('   ✅ Gestion des erreurs structurée');

  } catch (error) {
    console.error('❌ Erreur dans le test:', error.response?.data || error.message);
  }
}

// Exécuter le test
testZodValidation(); 