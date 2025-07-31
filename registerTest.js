const axios = require('axios');

// Configuration de l'URL de l'API
const API_URL = 'http://localhost:3000/api/auth/register';

// Données de test pour l'inscription
const userData = {
  email: "jane.doe@example.com",
  //password: "Mot2Passe!",
  firstName: "Jane",
  lastName: "Doe"
};

// Fonction pour tester l'inscription
async function testRegister() {
  try {
    console.log('🚀 Test de l\'inscription en cours...');
    console.log('📤 Données envoyées:', userData);
    console.log('');

    // Envoyer la requête POST
    const response = await axios.post(API_URL, userData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Succès ! Réponse du serveur:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
    // Afficher les cookies si présents
    if (response.headers['set-cookie']) {
      console.log('🍪 Cookies reçus:', response.headers['set-cookie']);
    }

  } catch (error) {
    console.log('❌ Erreur lors de l\'inscription:');
    
    if (error.response) {
      // Le serveur a répondu avec un code d'erreur
      console.log('Status:', error.response.status);
      console.log('Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      // La requête a été envoyée mais pas de réponse
      console.log('Pas de réponse du serveur. Le serveur est-il démarré?');
      console.log('Erreur:', error.message);
    } else {
      // Erreur dans la configuration de la requête
      console.log('Erreur de configuration:', error.message);
    }
  }
}

// Exécuter le test
testRegister();
