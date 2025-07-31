const axios = require('axios');

// URLs de test
const LOGIN_URL = 'http://localhost:3000/api/auth/login';
const PROPERTY_URL = 'http://localhost:3000/api/properties';

// Données de connexion
const loginData = {
  email: "jane.doe@example.com",
  password: "Mot2Passe!"
};

async function testUpdateProperty() {
  console.log('✏️ === Test de mise à jour de propriété ===\n');

  let cookies;
  let propertyId;

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

  // Étape 2: Créer une propriété à modifier
  console.log('2️⃣ Création d\'une propriété à modifier:');
  const originalPropertyData = {
    name: "Propriété Original",
    address: "123 Rue Original, Paris",
    description: "Description originale"
  };

  try {
    const createResponse = await axios.post(PROPERTY_URL, originalPropertyData, {
      headers: { 'Cookie': cookies.join('; ') }
    });
    
    propertyId = createResponse.data.data.property.id;
    console.log(`✅ Propriété créée: ${propertyId}`);
    console.log('📄 Données originales:', {
      name: createResponse.data.data.property.name,
      address: createResponse.data.data.property.address,
      description: createResponse.data.data.property.description
    });
  } catch (error) {
    console.log('❌ Erreur création propriété:', error.response?.data);
    return;
  }

  console.log('\n---\n');

  // Étape 3: Test mise à jour sans token (devrait échouer)
  console.log('3️⃣ Test mise à jour sans token (devrait échouer):');
  const updateData = { name: "Nom Modifié" };
  try {
    const response = await axios.put(`${PROPERTY_URL}/${propertyId}`, updateData);
    console.log('❌ Problème: Route non protégée!');
  } catch (error) {
    console.log('✅ Route protégée - Erreur attendue:', error.response?.data.message);
  }

  console.log('\n---\n');

  // Étape 4: Mise à jour partielle (nom seulement)
  console.log('4️⃣ Mise à jour partielle (nom seulement):');
  const partialUpdate = {
    name: "Appartement Modifié"
  };

  try {
    const response = await axios.put(`${PROPERTY_URL}/${propertyId}`, partialUpdate, {
      headers: { 'Cookie': cookies.join('; ') }
    });
    
    console.log('✅ Mise à jour partielle réussie!');
    console.log('📄 Propriété mise à jour:', {
      name: response.data.data.property.name,
      address: response.data.data.property.address,
      description: response.data.data.property.description
    });
  } catch (error) {
    console.log('❌ Erreur mise à jour partielle:', error.response?.data);
  }

  console.log('\n---\n');

  // Étape 5: Mise à jour complète
  console.log('5️⃣ Mise à jour complète:');
  const fullUpdate = {
    name: "Appartement Totalement Modifié",
    address: "456 Avenue Nouvelle, Lyon",
    description: "Description entièrement mise à jour"
  };

  try {
    const response = await axios.put(`${PROPERTY_URL}/${propertyId}`, fullUpdate, {
      headers: { 'Cookie': cookies.join('; ') }
    });
    
    console.log('✅ Mise à jour complète réussie!');
    console.log('📄 Propriété finale:', {
      name: response.data.data.property.name,
      address: response.data.data.property.address,
      description: response.data.data.property.description
    });
  } catch (error) {
    console.log('❌ Erreur mise à jour complète:', error.response?.data);
  }

  console.log('\n---\n');

  // Étape 6: Test avec ID inexistant
  console.log('6️⃣ Test avec ID inexistant (devrait échouer):');
  const fakeId = 'fake-property-id-123456789';
  try {
    const response = await axios.put(`${PROPERTY_URL}/${fakeId}`, { name: "Test" }, {
      headers: { 'Cookie': cookies.join('; ') }
    });
    console.log('❌ Problème: ID inexistant accepté!');
  } catch (error) {
    console.log('✅ ID inexistant rejeté - Erreur attendue:', error.response?.data.message);
    console.log('📊 Status code:', error.response?.status);
  }

  console.log('\n---\n');

  // Étape 7: Vérification avec GET pour confirmer les changements
  console.log('7️⃣ Vérification finale avec GET:');
  try {
    const response = await axios.get(`${PROPERTY_URL}/${propertyId}`, {
      headers: { 'Cookie': cookies.join('; ') }
    });
    
    console.log('✅ Vérification réussie!');
    console.log('📄 État final de la propriété:', {
      name: response.data.data.property.name,
      address: response.data.data.property.address,
      description: response.data.data.property.description,
      updatedAt: response.data.data.property.updatedAt
    });
  } catch (error) {
    console.log('❌ Erreur vérification:', error.response?.data);
  }

  console.log('\n---\n');

  // Étape 8: Test description vide (edge case)
  console.log('8️⃣ Test mise à jour avec description vide:');
  const emptyDescUpdate = {
    description: ""
  };

  try {
    const response = await axios.put(`${PROPERTY_URL}/${propertyId}`, emptyDescUpdate, {
      headers: { 'Cookie': cookies.join('; ') }
    });
    
    console.log('✅ Description vide acceptée!');
    console.log('📄 Description mise à jour:', response.data.data.property.description === "" ? "VIDE" : response.data.data.property.description);
  } catch (error) {
    console.log('❌ Erreur description vide:', error.response?.data);
  }

  console.log('\n🎯 Test de mise à jour terminé !');
}

// Lancer le test
testUpdateProperty(); 