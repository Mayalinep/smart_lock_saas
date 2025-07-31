const axios = require('axios');

// URLs de test
const LOGIN_URL = 'http://localhost:3000/api/auth/login';
const PROPERTY_URL = 'http://localhost:3000/api/properties';

// Données de connexion
const loginData = {
  email: "jane.doe@example.com",
  password: "Mot2Passe!"
};

// Données de propriété de test
const propertyData = {
  name: "Mon Appartement",
  address: "123 Rue de la Paix, Paris",
  description: "Bel appartement 2 pièces"
};

async function testCreateProperty() {
  console.log('🏠 === Test de création de propriété ===\n');

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

  // Étape 2: Tester création sans authentification (devrait échouer)
  console.log('2️⃣ Test création sans token (devrait échouer):');
  try {
    const response = await axios.post(PROPERTY_URL, propertyData);
    console.log('❌ Problème: Route non protégée!');
  } catch (error) {
    console.log('✅ Route protégée - Erreur attendue:', error.response?.data.message);
  }

  console.log('\n---\n');

  // Étape 3: Création de propriété avec token valide
  console.log('3️⃣ Création de propriété avec token valide:');
  try {
    const response = await axios.post(PROPERTY_URL, propertyData, {
      headers: { 'Cookie': cookies.join('; ') }
    });
    
    console.log('✅ Propriété créée avec succès!');
    console.log('📄 Réponse:', {
      message: response.data.message,
      property: {
        id: response.data.data.property.id,
        name: response.data.data.property.name,
        address: response.data.data.property.address,
        description: response.data.data.property.description,
        ownerId: response.data.data.property.ownerId
      }
    });
  } catch (error) {
    console.log('❌ Erreur de création:', error.response?.data);
  }

  console.log('\n---\n');

  // Étape 4: Test avec données incomplètes (devrait échouer)
  console.log('4️⃣ Test avec données incomplètes (devrait échouer):');
  try {
    const incompleteData = { name: "Appartement sans adresse" }; // Manque address
    const response = await axios.post(PROPERTY_URL, incompleteData, {
      headers: { 'Cookie': cookies.join('; ') }
    });
    console.log('❌ Problème: Validation manquante!');
  } catch (error) {
    console.log('✅ Validation fonctionne - Erreur attendue:', error.response?.data.message);
  }

  console.log('\n🎯 Test de propriété terminé !');
}

// Lancer le test
testCreateProperty(); 