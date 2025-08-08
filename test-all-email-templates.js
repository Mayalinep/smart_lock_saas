const emailTemplateService = require('./src/services/emailTemplateService');
const fs = require('fs').promises;

async function testAllEmailTemplates() {
    console.log('🧪 Test de tous les templates email HTML...\n');

    try {
        // Test 1: Email de bienvenue
        console.log('📧 Test 1: Email de bienvenue');
        const welcomeUser = {
            firstName: 'Marie',
            email: 'marie@example.com'
        };
        
        const welcomeHTML = await emailTemplateService.generateWelcomeEmail(welcomeUser);
        await fs.writeFile('test-welcome-email.html', welcomeHTML);
        console.log('✅ Email de bienvenue généré');

        // Test 2: Email de nouveau code d'accès
        console.log('\n📧 Test 2: Email de nouveau code d\'accès');
        const accessData = {
            guestName: 'Jean Dupont',
            propertyName: 'Appartement Paris',
            accessCode: '123456',
            startDate: new Date(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            ownerName: 'Marie Martin'
        };
        
        const accessHTML = await emailTemplateService.generateNewAccessEmail(accessData);
        await fs.writeFile('test-access-email.html', accessHTML);
        console.log('✅ Email de nouveau code d\'accès généré');

        // Test 3: Email de révocation
        console.log('\n📧 Test 3: Email de révocation d\'accès');
        const revocationData = {
            guestName: 'Jean Dupont',
            propertyName: 'Appartement Paris',
            ownerName: 'Marie Martin',
            reason: 'Fin de séjour'
        };
        
        const revocationHTML = await emailTemplateService.generateRevocationEmail(revocationData);
        await fs.writeFile('test-revocation-email.html', revocationHTML);
        console.log('✅ Email de révocation généré');

        // Test 4: Email d'alerte batterie
        console.log('\n📧 Test 4: Email d\'alerte batterie faible');
        const batteryData = {
            propertyName: 'Appartement Paris',
            batteryLevel: 15,
            lockId: 'LOCK_12345',
            lastUpdate: new Date()
        };
        
        const batteryHTML = await emailTemplateService.generateBatteryLowEmail(batteryData);
        await fs.writeFile('test-battery-email.html', batteryHTML);
        console.log('✅ Email d\'alerte batterie généré');

        // Test 5: Email de tentative échouée
        console.log('\n📧 Test 5: Email de tentative d\'accès échouée');
        const securityData = {
            propertyName: 'Appartement Paris',
            attemptTime: new Date(),
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)'
        };
        
        const securityHTML = await emailTemplateService.generateFailedAccessEmail(securityData);
        await fs.writeFile('test-security-email.html', securityHTML);
        console.log('✅ Email de tentative échouée généré');

        console.log('\n🎉 Tous les templates fonctionnent parfaitement !');
        console.log('\n📁 Fichiers générés :');
        console.log('   - test-welcome-email.html');
        console.log('   - test-access-email.html');
        console.log('   - test-revocation-email.html');
        console.log('   - test-battery-email.html');
        console.log('   - test-security-email.html');
        console.log('\n💡 Ouvrez ces fichiers dans votre navigateur pour voir le résultat !');

    } catch (error) {
        console.error('❌ Erreur lors du test des templates:', error);
    }
}

// Exécuter le test
testAllEmailTemplates(); 