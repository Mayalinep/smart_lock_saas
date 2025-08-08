const axios = require('axios');

// Configuration
const BASE_URL = process.env.API_URL || 'https://smart-lock-saas-backend.vercel.app';
const TEST_EMAIL = `test-${Date.now()}@example.com`;
const TEST_PASSWORD = 'TestPassword123!';

class ProductionAPITester {
    constructor() {
        this.token = null;
        this.userId = null;
        this.propertyId = null;
        this.accessId = null;
        this.testResults = [];
    }

    async log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : '📝';
        console.log(`${emoji} [${timestamp}] ${message}`);
    }

    async testEndpoint(endpoint, method = 'GET', data = null, description = '') {
        try {
            const config = {
                method,
                url: `${BASE_URL}${endpoint}`,
                headers: {
                    'Content-Type': 'application/json',
                    ...(this.token && { 'Authorization': `Bearer ${this.token}` })
                },
                ...(data && { data })
            };

            const response = await axios(config);
            
            await this.log(`SUCCÈS: ${description || endpoint} (${response.status})`, 'success');
            return { success: true, data: response.data, status: response.status };
        } catch (error) {
            const status = error.response?.status || 'NETWORK_ERROR';
            const message = error.response?.data?.message || error.message;
            await this.log(`ÉCHEC: ${description || endpoint} (${status}) - ${message}`, 'error');
            return { success: false, error: message, status };
        }
    }

    async runTests() {
        console.log('🧪 TESTS DE L\'API EN PRODUCTION');
        console.log('=====================================\n');

        // Test 1: Health Check
        await this.log('🔍 Test 1: Vérification de la santé de l\'API');
        const healthResult = await this.testEndpoint('/api/health', 'GET', null, 'Health Check');
        if (!healthResult.success) {
            await this.log('❌ L\'API n\'est pas accessible. Vérifiez l\'URL et le déploiement.', 'error');
            return;
        }

        // Test 2: Inscription
        await this.log('\n🔍 Test 2: Inscription d\'un utilisateur test');
        const registerData = {
            email: TEST_EMAIL,
            password: TEST_PASSWORD,
            firstName: 'Test',
            lastName: 'User',
            phone: '+33123456789'
        };
        const registerResult = await this.testEndpoint('/api/auth/register', 'POST', registerData, 'Inscription');
        
        if (registerResult.success) {
            this.token = registerResult.data.token;
            this.userId = registerResult.data.user.id;
            await this.log(`✅ Utilisateur créé avec ID: ${this.userId}`, 'success');
        }

        // Test 3: Connexion
        await this.log('\n🔍 Test 3: Connexion utilisateur');
        const loginData = {
            email: TEST_EMAIL,
            password: TEST_PASSWORD
        };
        const loginResult = await this.testEndpoint('/api/auth/login', 'POST', loginData, 'Connexion');
        
        if (loginResult.success) {
            this.token = loginResult.data.token;
            await this.log('✅ Connexion réussie', 'success');
        }

        // Test 4: Profil utilisateur
        await this.log('\n🔍 Test 4: Récupération du profil');
        await this.testEndpoint('/api/auth/profile', 'GET', null, 'Profil utilisateur');

        // Test 5: Setup 2FA
        await this.log('\n🔍 Test 5: Configuration 2FA');
        const setup2FAResult = await this.testEndpoint('/api/2fa/setup', 'POST', null, 'Setup 2FA');
        
        if (setup2FAResult.success) {
            await this.log('✅ Setup 2FA réussi', 'success');
            await this.log(`📱 QR Code disponible: ${setup2FAResult.data.qrCode ? 'OUI' : 'NON'}`, 'info');
            await this.log(`🔑 Backup codes: ${setup2FAResult.data.backupCodes?.length || 0} codes`, 'info');
        }

        // Test 6: Création d'une propriété
        await this.log('\n🔍 Test 6: Création d\'une propriété');
        const propertyData = {
            name: 'Appartement Test',
            address: '123 Rue de Test, 75001 Paris',
            description: 'Appartement de test pour validation API'
        };
        const propertyResult = await this.testEndpoint('/api/properties', 'POST', propertyData, 'Création propriété');
        
        if (propertyResult.success) {
            this.propertyId = propertyResult.data.id;
            await this.log(`✅ Propriété créée avec ID: ${this.propertyId}`, 'success');
        }

        // Test 7: Liste des propriétés
        await this.log('\n🔍 Test 7: Liste des propriétés');
        await this.testEndpoint('/api/properties', 'GET', null, 'Liste propriétés');

        // Test 8: Création d'un accès
        if (this.propertyId) {
            await this.log('\n🔍 Test 8: Création d\'un accès');
            const accessData = {
                propertyId: this.propertyId,
                guestName: 'Invité Test',
                startDate: new Date().toISOString(),
                endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                permissions: ['ENTRY', 'EXIT']
            };
            const accessResult = await this.testEndpoint('/api/access', 'POST', accessData, 'Création accès');
            
            if (accessResult.success) {
                this.accessId = accessResult.data.id;
                await this.log(`✅ Accès créé avec ID: ${this.accessId}`, 'success');
                await this.log(`🔑 Code d'accès: ${accessResult.data.accessCode}`, 'info');
            }
        }

        // Test 9: Liste des accès
        await this.log('\n🔍 Test 9: Liste des accès');
        await this.testEndpoint('/api/access', 'GET', null, 'Liste accès');

        // Test 10: Webhooks
        await this.log('\n🔍 Test 10: Configuration webhook');
        const webhookData = {
            url: 'https://webhook.site/test',
            events: ['ACCESS_GRANTED', 'ACCESS_REVOKED'],
            secret: 'test-secret-key'
        };
        await this.testEndpoint('/api/webhooks', 'POST', webhookData, 'Configuration webhook');

        // Test 11: Métriques
        await this.log('\n🔍 Test 11: Métriques');
        await this.testEndpoint('/api/health/metrics', 'GET', null, 'Métriques');

        // Test 12: Documentation API
        await this.log('\n🔍 Test 12: Documentation API');
        await this.testEndpoint('/api/docs', 'GET', null, 'Documentation Swagger');

        // Test 13: Nettoyage (suppression des données de test)
        await this.log('\n🔍 Test 13: Nettoyage des données de test');
        if (this.accessId) {
            await this.testEndpoint(`/api/access/${this.accessId}`, 'DELETE', null, 'Suppression accès');
        }
        if (this.propertyId) {
            await this.testEndpoint(`/api/properties/${this.propertyId}`, 'DELETE', null, 'Suppression propriété');
        }

        console.log('\n🎉 TESTS TERMINÉS');
        console.log('==================');
        console.log(`📊 Résultats: ${this.testResults.filter(r => r.success).length}/${this.testResults.length} tests réussis`);
        console.log(`🌐 URL testée: ${BASE_URL}`);
        console.log(`👤 Utilisateur test: ${TEST_EMAIL}`);
    }
}

// Exécuter les tests
async function main() {
    const tester = new ProductionAPITester();
    await tester.runTests();
}

main().catch(console.error); 