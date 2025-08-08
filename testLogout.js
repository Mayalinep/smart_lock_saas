const axios = require('axios');

// URLs de test
const LOGIN_URL = 'http://localhost:3000/api/auth/login';
const LOGOUT_URL = 'http://localhost:3000/api/auth/logout';
const PROTECTED_URL = 'http://localhost:3000/api/auth/me';

// Données de login
const loginData = {
  email: "jane.doe@example.com",
  password: "Mot2Passe!"
};

async function testLogout() {
  console.log('🔐 === Test du logout ===\n');

  let cookies;

  // Étape 1: Se connecter pour avoir un token
  console.log('1️⃣ Connexion pour récupérer un token:');
  try {
    const loginResponse = await axios.post(LOGIN_URL, loginData);
    console.log('✅ Connexion réussie');
    
    cookies = loginResponse.headers['set-cookie'];
    console.log('🍪 Token reçu:', cookies ? 'OUI' : 'NON');
  } catch (error) {
    console.log('❌ Erreur de connexion:', error.response?.data);
    return;
  }

  console.log('\n---\n');

  // Étape 2: Vérifier que le token fonctionne
  console.log('2️⃣ Test avec token valide (avant logout):');
  try {
    const response = await axios.get(PROTECTED_URL, {
      headers: { 'Cookie': cookies.join('; ') }
    });
    console.log('✅ Accès autorisé:', response.data.message);
  } catch (error) {
    console.log('❌ Token invalide:', error.response?.data);
    return;
  }

  console.log('\n---\n');

  // Étape 3: Se déconnecter
  console.log('3️⃣ Déconnexion:');
  try {
    const logoutResponse = await axios.post(LOGOUT_URL, {}, {
      headers: { 'Cookie': cookies.join('; ') }
    });
    console.log('✅ Déconnexion réussie:', logoutResponse.data.message);
    
    // Vérifier si le serveur envoie une instruction de suppression de cookie
    const setCookieHeaders = logoutResponse.headers['set-cookie'];
    if (setCookieHeaders) {
      console.log('🍪 Cookie supprimé par le serveur:', setCookieHeaders);
    }
  } catch (error) {
    console.log('❌ Erreur de déconnexion:', error.response?.data);
    return;
  }

  console.log('\n---\n');

  // Étape 4: Vérifier qu'on ne peut plus accéder AVEC l'ancien token (blacklist)
  console.log('4️⃣ Test avec ancien token (après logout - doit être refusé par blacklist):');
  try {
    await axios.get(PROTECTED_URL, { headers: { 'Cookie': cookies.join('; ') } });
    console.log('❌ Problème: Accès autorisé avec token blacklité!');
  } catch (error) {
    console.log('✅ Ancien token refusé (attendu):', error.response?.status, error.response?.data?.message);
  }

  console.log('\n🎯 Test logout terminé !');
}

// Lancer le test
testLogout(); 