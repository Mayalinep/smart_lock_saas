const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function setupUsers() {
  console.log('🔧 Configuration des utilisateurs après migration...\n');
  
  try {
    // 1. Créer le propriétaire principal
    console.log('1️⃣ Création du propriétaire principal:');
    const owner = await axios.post(`${BASE_URL}/auth/register`, {
      email: 'jane.doe@example.com',
      password: 'Mot2Passe!',
      firstName: 'Jane',
      lastName: 'Doe'
    });
    console.log('✅ Propriétaire principal créé');

    // 2. Créer l'utilisateur cible
    console.log('2️⃣ Création de l\'utilisateur cible:');
    const target = await axios.post(`${BASE_URL}/auth/register`, {
      email: 'target.user@example.com',
      password: 'TargetPass123!',
      firstName: 'Target',
      lastName: 'User'
    });
    console.log('✅ Utilisateur cible créé');

    console.log('\n🎯 Utilisateurs configurés ! Tu peux maintenant lancer testSoftDelete.js');

  } catch (error) {
    if (error.response?.status === 409) {
      console.log('✅ Utilisateurs déjà existants');
    } else {
      console.error('❌ Erreur:', error.response?.data || error.message);
    }
  }
}

setupUsers(); 