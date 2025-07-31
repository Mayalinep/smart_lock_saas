const axios = require('axios');

// URLs de test
const LOGIN_URL = 'http://localhost:3000/api/auth/login';
const PROTECTED_URL = 'http://localhost:3000/api/auth/me';

// Données de login
const loginData = {
  email: "jane.doe@example.com",
  password: "Mot2Passe!"
};

async function testAuthentication() {
  console.log('🧪 === Test du middleware d\'authentification ===\n');

  // Test 1: Accès sans token (devrait échouer)
  console.log('1️⃣ Test sans token (devrait échouer):');
  try {
    const response = await axios.get(PROTECTED_URL);
    console.log('❌ Erreur: La route devrait être protégée!');
  } catch (error) {
    console.log('✅ Route protégée - Erreur attendue:', error.response?.data);
  }

  console.log('\n---\n');

  // Test 2: Login pour récupérer un token
  console.log('2️⃣ Connexion pour récupérer un token:');
  let cookies;
  try {
    const loginResponse = await axios.post(LOGIN_URL, loginData);
    console.log('✅ Connexion réussie:', loginResponse.data.message);
    
    // Extraire les cookies de la réponse
    cookies = loginResponse.headers['set-cookie'];
    console.log('🍪 Cookie reçu:', cookies ? 'OUI' : 'NON');
  } catch (error) {
    console.log('❌ Erreur de connexion:', error.response?.data);
    return; // Arrêter si la connexion échoue
  }

  console.log('\n---\n');

  // Test 3: Accès avec token valide (devrait réussir)
  console.log('3️⃣ Test avec token valide (devrait réussir):');
  try {
    const response = await axios.get(PROTECTED_URL, {
      headers: {
        // Transmettre le cookie avec la requête
        'Cookie': cookies ? cookies.join('; ') : ''
      }
    });
    console.log('✅ Accès autorisé:', response.data);
  } catch (error) {
    console.log('❌ Erreur:', error.response?.data);
  }

  console.log('\n---\n');

  // Test 4: Accès avec token invalide (devrait échouer)
  console.log('4️⃣ Test avec token invalide (devrait échouer):');
  try {
    const response = await axios.get(PROTECTED_URL, {
      headers: {
        'Cookie': 'token=fake_invalid_token'
      }
    });
    console.log('❌ Erreur: Token invalide accepté!');
  } catch (error) {
    console.log('✅ Token invalide rejeté - Erreur attendue:', error.response?.data);
  }

  console.log('\n🎯 Tests terminés !');
}

// Lancer les tests
testAuthentication(); 