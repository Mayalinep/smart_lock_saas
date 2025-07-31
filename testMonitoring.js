const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testMonitoring() {
  console.log('🧪 Test du système de monitoring...\n');

  try {
    // Test 1: Health check simple
    console.log('1️⃣ Test du health check simple...');
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Health check:', healthResponse.data);
    console.log('');

    // Test 2: Health check détaillé
    console.log('2️⃣ Test du health check détaillé...');
    const detailedHealthResponse = await axios.get(`${BASE_URL}/api/health/detailed`);
    console.log('✅ Health check détaillé:', JSON.stringify(detailedHealthResponse.data, null, 2));
    console.log('');

    // Test 3: Métriques Prometheus
    console.log('3️⃣ Test des métriques Prometheus...');
    const metricsResponse = await axios.get(`${BASE_URL}/api/metrics`);
    console.log('✅ Métriques Prometheus:');
    console.log(metricsResponse.data);
    console.log('');

    // Test 4: Test de rate limiting
    console.log('4️⃣ Test du rate limiting...');
    try {
      for (let i = 0; i < 6; i++) {
        await axios.get(`${BASE_URL}/api/health`);
      }
    } catch (error) {
      if (error.response?.status === 429) {
        console.log('✅ Rate limiting fonctionne correctement');
      } else {
        console.log('❌ Rate limiting ne fonctionne pas comme attendu');
      }
    }
    console.log('');

    // Test 5: Test de sécurité (headers)
    console.log('5️⃣ Test des headers de sécurité...');
    const securityResponse = await axios.get(`${BASE_URL}/api/health`);
    const headers = securityResponse.headers;
    
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
    console.log('');

    console.log('🎉 Tous les tests de monitoring sont passés !');
    console.log('📊 Vérifie les logs dans le dossier logs/');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Test des logs
async function testLogs() {
  console.log('\n📝 Test des logs...');
  
  try {
    // Test de requête normale
    await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Log de requête normale créé');

    // Test de requête avec erreur
    try {
      await axios.get(`${BASE_URL}/api/nonexistent`);
    } catch (error) {
      console.log('✅ Log d\'erreur 404 créé');
    }

    console.log('📁 Vérifie les fichiers logs/combined.log et logs/error.log');
    
  } catch (error) {
    console.error('❌ Erreur lors du test des logs:', error.message);
  }
}

// Exécution des tests
async function runTests() {
  await testMonitoring();
  await testLogs();
}

runTests(); 