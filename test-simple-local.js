const axios = require('axios');

async function testSimple() {
    console.log('🧪 TEST SIMPLE DE L\'API EN LOCAL');
    console.log('===================================\n');

    try {
        // Test 1: Health check
        console.log('📝 Test 1: Health check');
        const healthResponse = await axios.get('http://localhost:3000/api/health');
        console.log('✅ Health check OK:', healthResponse.data);

        // Test 2: Inscription
        console.log('\n📝 Test 2: Inscription');
        const registerResponse = await axios.post('http://localhost:3000/api/auth/register', {
            email: `test-${Date.now()}@example.com`,
            password: 'Test123!',
            firstName: 'Test',
            lastName: 'User',
            phone: '+33123456789'
        });
        console.log('✅ Inscription OK:', registerResponse.data);

        // Test 3: Connexion
        console.log('\n📝 Test 3: Connexion');
        const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
            email: 'test@example.com',
            password: 'Test123!'
        });
        console.log('✅ Connexion OK:', loginResponse.data);

        // Test 4: Vérifier les cookies
        console.log('\n📝 Test 4: Cookies de la réponse de connexion');
        const cookies = loginResponse.headers['set-cookie'];
        if (cookies) {
            console.log('🍪 Cookies reçus:', cookies);
            const tokenCookie = cookies.find(cookie => cookie.includes('token='));
            if (tokenCookie) {
                console.log('🔑 Token trouvé dans les cookies');
            } else {
                console.log('❌ Token non trouvé dans les cookies');
            }
        } else {
            console.log('❌ Aucun cookie reçu');
        }

        // Test 5: Création d'une propriété (avec cookies)
        console.log('\n📝 Test 5: Création d\'une propriété');
        const propertyResponse = await axios.post('http://localhost:3000/api/properties', {
            name: 'Appartement Test',
            address: '123 Rue de Test, 75001 Paris',
            description: 'Appartement de test'
        }, {
            headers: {
                'Cookie': cookies ? cookies.join('; ') : ''
            }
        });
        console.log('✅ Création propriété OK:', propertyResponse.data);

        console.log('\n🎉 Tests terminés avec succès !');

    } catch (error) {
        console.error('❌ Erreur:', error.response?.data || error.message);
    }
}

testSimple(); 