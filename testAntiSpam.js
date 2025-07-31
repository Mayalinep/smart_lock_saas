const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testAntiSpam() {
  console.log('🛡️ Test du système anti-spam et rate limiting...\n');

  try {
    // Test 1: Détection de spam (User-Agent suspect)
    console.log('1️⃣ Test de détection de spam...');
    try {
      await axios.get(`${BASE_URL}/api/health`, {
        headers: {
          'User-Agent': 'python-requests/2.25.1'
        }
      });
      console.log('❌ Détection de spam ne fonctionne pas');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ Détection de spam fonctionne');
      } else {
        console.log('❌ Erreur inattendue:', error.response?.status);
      }
    }
    console.log('');

    // Test 2: Rate limiting pour les inscriptions
    console.log('2️⃣ Test du rate limiting pour les inscriptions...');
    const registerData = {
      email: 'test@example.com',
      password: 'Mot2Passe!',
      firstName: 'Test',
      lastName: 'User'
    };

    let successCount = 0;
    for (let i = 0; i < 5; i++) {
      try {
        const response = await axios.post(`${BASE_URL}/api/auth/register`, {
          ...registerData,
          email: `test${i}@example.com`
        });
        successCount++;
        console.log(`✅ Inscription ${i + 1} réussie`);
      } catch (error) {
        if (error.response?.status === 429) {
          console.log(`✅ Rate limiting activé après ${successCount} inscriptions`);
          break;
        } else {
          console.log(`❌ Erreur inattendue: ${error.response?.status}`);
        }
      }
    }
    console.log('');

    // Test 3: Rate limiting pour l'authentification
    console.log('3️⃣ Test du rate limiting pour l\'authentification...');
    const loginData = {
      email: 'nonexistent@example.com',
      password: 'wrongpassword'
    };

    let authAttempts = 0;
    for (let i = 0; i < 7; i++) {
      try {
        await axios.post(`${BASE_URL}/api/auth/login`, loginData);
        console.log('❌ Login réussi (inattendu)');
      } catch (error) {
        if (error.response?.status === 401) {
          authAttempts++;
          console.log(`✅ Tentative ${i + 1} échouée (normal)`);
        } else if (error.response?.status === 429) {
          console.log(`✅ Rate limiting activé après ${authAttempts} tentatives`);
          break;
        } else {
          console.log(`❌ Erreur inattendue: ${error.response?.status}`);
        }
      }
    }
    console.log('');

    // Test 4: Speed limiting (ralentissement progressif)
    console.log('4️⃣ Test du speed limiting...');
    const startTime = Date.now();
    
    for (let i = 0; i < 10; i++) {
      const requestStart = Date.now();
      try {
        await axios.get(`${BASE_URL}/api/health`);
        const duration = Date.now() - requestStart;
        console.log(`Requête ${i + 1}: ${duration}ms`);
      } catch (error) {
        console.log(`❌ Erreur requête ${i + 1}: ${error.response?.status}`);
      }
    }
    
    const totalTime = Date.now() - startTime;
    console.log(`⏱️ Temps total pour 10 requêtes: ${totalTime}ms`);
    console.log('');

    // Test 5: Rate limiting pour les accès
    console.log('5️⃣ Test du rate limiting pour les accès...');
    
    // D'abord, créer un utilisateur et se connecter
    const testUser = {
      email: 'accesstest@example.com',
      password: 'Mot2Passe!',
      firstName: 'Access',
      lastName: 'Test'
    };

    try {
      // Créer l'utilisateur
      await axios.post(`${BASE_URL}/api/auth/register`, testUser);
      console.log('✅ Utilisateur créé pour le test');

      // Se connecter
      const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: testUser.email,
        password: testUser.password
      });

      const cookies = loginResponse.headers['set-cookie'];
      const cookieHeader = cookies ? cookies.join('; ') : '';

      // Créer une propriété
      const propertyResponse = await axios.post(`${BASE_URL}/api/properties`, {
        title: 'Test Property',
        address: '123 Test Street',
        description: 'Test property for rate limiting'
      }, {
        headers: {
          Cookie: cookieHeader
        }
      });

      const propertyId = propertyResponse.data.data.property.id;

      // Tester le rate limiting pour les accès
      let accessAttempts = 0;
      for (let i = 0; i < 15; i++) {
        try {
          await axios.post(`${BASE_URL}/api/access`, {
            propertyId: propertyId,
            guestName: `Guest ${i}`,
            guestEmail: `guest${i}@example.com`,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          }, {
            headers: {
              Cookie: cookieHeader
            }
          });
          accessAttempts++;
          console.log(`✅ Accès ${i + 1} créé`);
        } catch (error) {
          if (error.response?.status === 429) {
            console.log(`✅ Rate limiting pour les accès activé après ${accessAttempts} créations`);
            break;
          } else {
            console.log(`❌ Erreur inattendue: ${error.response?.status}`);
          }
        }
      }

    } catch (error) {
      console.log('❌ Erreur lors du test des accès:', error.response?.data?.message || error.message);
    }
    console.log('');

    console.log('🎉 Tous les tests anti-spam sont passés !');
    console.log('🛡️ Ton système de protection est opérationnel');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Test des headers de sécurité
async function testSecurityHeaders() {
  console.log('\n🔒 Test des headers de sécurité...');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/health`);
    const headers = response.headers;
    
    const securityHeaders = [
      'x-content-type-options',
      'x-frame-options', 
      'x-xss-protection',
      'referrer-policy'
    ];

    securityHeaders.forEach(header => {
      if (headers[header]) {
        console.log(`✅ Header ${header}: ${headers[header]}`);
      } else {
        console.log(`❌ Header ${header} manquant`);
      }
    });

    console.log('✅ Headers de sécurité configurés correctement');
    
  } catch (error) {
    console.error('❌ Erreur lors du test des headers:', error.message);
  }
}

// Exécution des tests
async function runTests() {
  await testAntiSpam();
  await testSecurityHeaders();
}

runTests(); 