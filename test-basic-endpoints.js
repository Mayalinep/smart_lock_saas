const axios = require('axios');

const BASE_URL = 'https://smart-lock-saas-lsymrknzg-mayas-projects-b1d345cf.vercel.app';

async function testBasicEndpoints() {
    console.log('🔍 TESTS DES ENDPOINTS DE BASE');
    console.log('================================\n');

    const endpoints = [
        { path: '/api/health', method: 'GET', description: 'Health check' },
        { path: '/api/docs', method: 'GET', description: 'API documentation' },
        { path: '/api/metrics', method: 'GET', description: 'Metrics' },
        { path: '/api/auth/register', method: 'POST', description: 'Register (POST)', data: { 
            email: 'testuser' + Date.now() + '@example.com', 
            password: 'TestPassword123!', 
            firstName: 'Test', 
            lastName: 'User' 
        } },
        { path: '/api/auth/login', method: 'POST', description: 'Login (POST)', data: { 
            email: 'test@example.com', 
            password: 'TestPassword123!' 
        } }
    ];

    for (const endpoint of endpoints) {
        try {
            console.log(`📝 Test: ${endpoint.description}`);
            console.log(`🌐 URL: ${BASE_URL}${endpoint.path}`);
            
            const config = {
                method: endpoint.method,
                url: `${BASE_URL}${endpoint.path}`,
                headers: {
                    'Content-Type': 'application/json'
                },
                ...(endpoint.data && { data: endpoint.data })
            };

            const response = await axios(config);
            console.log(`✅ SUCCÈS (${response.status}): ${response.statusText}`);
            if (response.data) {
                console.log(`📄 Réponse: ${JSON.stringify(response.data).substring(0, 200)}...`);
            }
        } catch (error) {
            const status = error.response?.status || 'NETWORK_ERROR';
            const message = error.response?.data?.message || error.message;
            console.log(`❌ ÉCHEC (${status}): ${message}`);
            
            if (error.response?.data) {
                console.log(`📄 Détails: ${JSON.stringify(error.response.data).substring(0, 200)}...`);
            }
        }
        console.log('---\n');
    }
}

testBasicEndpoints().catch(console.error); 