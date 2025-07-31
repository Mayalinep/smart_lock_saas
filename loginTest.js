const axios = require('axios');

const API_URL = 'http://localhost:3000/api/auth/login';

const userData = {
  email: "jane.doe@example.com",
  password: "Mot2Passe!"
};

async function testLogin() {
  try {
    console.log('🚀 Test de connexion en cours...');
    const response = await axios.post(API_URL, userData);
    
    console.log('✅ Succès ! Réponse:', response.data);
    console.log('🍪 Cookies:', response.headers['set-cookie']);
  } catch (error) {
    console.log('❌ Erreur:', error.response?.data || error.message);
  }
}

testLogin();