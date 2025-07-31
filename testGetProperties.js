const axios = require('axios');

// URLs de test
const LOGIN_URL = 'http://localhost:3000/api/auth/login';
const PROPERTY_URL = 'http://localhost:3000/api/properties';

// Données de connexion
const loginData = {
  email: "jane.doe@example.com",
  password: "Mot2Passe!"
};

async function testGetProperties() {
  console.log('📋 === Test de récupération des propriétés ===\n');

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

  // Étape 2: Tester récupération sans authentification (devrait échouer)
  console.log('2️⃣ Test récupération sans token (devrait échouer):');
  try {
    const response = await axios.get(PROPERTY_URL);
    console.log('❌ Problème: Route non protégée!');
  } catch (error) {
    console.log('✅ Route protégée - Erreur attendue:', error.response?.data.message);
  }

  console.log('\n---\n');

  // Étape 3: Récupération des propriétés avec token valide
  console.log('3️⃣ Récupération des propriétés avec token valide:');
  try {
    const response = await axios.get(PROPERTY_URL, {
      headers: { 'Cookie': cookies.join('; ') }
    });
    
    console.log('✅ Propriétés récupérées avec succès!');
    console.log('📄 Réponse:', {
      message: response.data.message,
      nombreProprietes: response.data.data.properties.length,
      proprietes: response.data.data.properties.map(prop => ({
        id: prop.id,
        name: prop.name,
        address: prop.address,
        description: prop.description
      }))
    });
  } catch (error) {
    console.log('❌ Erreur de récupération:', error.response?.data);
  }

  console.log('\n---\n');

  // Étape 4: Créer une nouvelle propriété et vérifier qu'elle apparaît dans la liste
  console.log('4️⃣ Créer une propriété puis vérifier la liste mise à jour:');
  
  // D'abord créer une propriété
  const newPropertyData = {
    name: "Nouvelle Propriété Test",
    address: "456 Avenue Test, Lyon",
    description: "Propriété pour test de liste"
  };

  let newPropertyId;
  try {
    const createResponse = await axios.post(PROPERTY_URL, newPropertyData, {
      headers: { 'Cookie': cookies.join('; ') }
    });
    newPropertyId = createResponse.data.data.property.id;
    console.log(`✅ Nouvelle propriété créée: ${newPropertyId}`);
  } catch (error) {
    console.log('❌ Erreur création propriété:', error.response?.data);
    return;
  }

  // Puis récupérer la liste mise à jour
  try {
    const response = await axios.get(PROPERTY_URL, {
      headers: { 'Cookie': cookies.join('; ') }
    });
    
    const properties = response.data.data.properties;
    const newProperty = properties.find(p => p.id === newPropertyId);
    
    console.log(`✅ Liste mise à jour - Nombre total: ${properties.length}`);
    console.log('🆕 Nouvelle propriété trouvée:', newProperty ? 'OUI' : 'NON');
    
    if (newProperty) {
      console.log('📄 Détails nouvelle propriété:', {
        name: newProperty.name,
        address: newProperty.address,
        description: newProperty.description
      });
    }
  } catch (error) {
    console.log('❌ Erreur récupération liste mise à jour:', error.response?.data);
  }

  console.log('\n🎯 Test de récupération des propriétés terminé !');
}

// Lancer le test
testGetProperties(); 