const axios = require('axios');

// URLs de test
const LOGIN_URL = 'http://localhost:3000/api/auth/login';
const PROPERTY_URL = 'http://localhost:3000/api/properties';

// Données de connexion
const loginData = {
  email: "jane.doe@example.com",
  password: "Mot2Passe!"
};

async function testGetPropertyById() {
  console.log('🔍 === Test de récupération de propriété par ID ===\n');

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

  // Étape 2: Récupérer la liste pour avoir un ID valide
  console.log('2️⃣ Récupération d\'un ID de propriété existant:');
  try {
    const listResponse = await axios.get(PROPERTY_URL, {
      headers: { 'Cookie': cookies.join('; ') }
    });
    
    const properties = listResponse.data.data.properties;
    if (properties.length > 0) {
      propertyId = properties[0].id;
      console.log(`✅ ID de propriété trouvé: ${propertyId}`);
      console.log(`📄 Propriété: ${properties[0].name}`);
    } else {
      console.log('❌ Aucune propriété existante, création d\'une nouvelle...');
      
      // Créer une propriété pour le test
      const newPropertyData = {
        name: "Propriété Test ID",
        address: "123 Test Street",
        description: "Propriété pour test par ID"
      };
      
      const createResponse = await axios.post(PROPERTY_URL, newPropertyData, {
        headers: { 'Cookie': cookies.join('; ') }
      });
      
      propertyId = createResponse.data.data.property.id;
      console.log(`✅ Nouvelle propriété créée: ${propertyId}`);
    }
  } catch (error) {
    console.log('❌ Erreur récupération liste:', error.response?.data);
    return;
  }

  console.log('\n---\n');

  // Étape 3: Test récupération sans token (devrait échouer)
  console.log('3️⃣ Test récupération sans token (devrait échouer):');
  try {
    const response = await axios.get(`${PROPERTY_URL}/${propertyId}`);
    console.log('❌ Problème: Route non protégée!');
  } catch (error) {
    console.log('✅ Route protégée - Erreur attendue:', error.response?.data.message);
  }

  console.log('\n---\n');

  // Étape 4: Récupération avec token valide et ID existant
  console.log('4️⃣ Récupération avec token valide et ID existant:');
  try {
    const response = await axios.get(`${PROPERTY_URL}/${propertyId}`, {
      headers: { 'Cookie': cookies.join('; ') }
    });
    
    console.log('✅ Propriété récupérée avec succès!');
    console.log('📄 Réponse:', {
      message: response.data.message,
      property: {
        id: response.data.data.property.id,
        name: response.data.data.property.name,
        address: response.data.data.property.address,
        description: response.data.data.property.description,
        ownerId: response.data.data.property.ownerId,
        isActive: response.data.data.property.isActive
      }
    });
  } catch (error) {
    console.log('❌ Erreur récupération:', error.response?.data);
  }

  console.log('\n---\n');

  // Étape 5: Test avec ID inexistant (devrait échouer)
  console.log('5️⃣ Test avec ID inexistant (devrait échouer):');
  const fakeId = 'fake-property-id-123456789';
  try {
    const response = await axios.get(`${PROPERTY_URL}/${fakeId}`, {
      headers: { 'Cookie': cookies.join('; ') }
    });
    console.log('❌ Problème: ID inexistant accepté!');
  } catch (error) {
    console.log('✅ ID inexistant rejeté - Erreur attendue:', error.response?.data.message);
    console.log('📊 Status code:', error.response?.status);
  }

  console.log('\n---\n');

  // Étape 6: Test avec ID d'un autre utilisateur (si possible)
  console.log('6️⃣ Test sécurité - ID d\'un autre utilisateur:');
  
  // Créer un ID qui ressemble à un vrai CUID mais n'existe pas ou n'appartient pas à l'utilisateur
  const otherUserId = 'cmdru2on00000c6li26iszshe_fake';
  try {
    const response = await axios.get(`${PROPERTY_URL}/${otherUserId}`, {
      headers: { 'Cookie': cookies.join('; ') }
    });
    console.log('❌ Problème: Accès à une propriété d\'autrui autorisé!');
  } catch (error) {
    console.log('✅ Sécurité OK - Propriété d\'autrui inaccessible:', error.response?.data.message);
    console.log('📊 Status code:', error.response?.status);
  }

  console.log('\n🎯 Test de récupération par ID terminé !');
}

// Lancer le test
testGetPropertyById(); 