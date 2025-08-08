const emailTemplateService = require('./src/services/emailTemplateService');
const fs = require('fs').promises;
const path = require('path');

async function testEmailTemplates() {
    console.log('🧪 Test des templates email HTML...\n');

    try {
        // Test 1: Email de bienvenue
        console.log('📧 Test 1: Email de bienvenue');
        const welcomeUser = {
            firstName: 'Marie',
            email: 'marie@example.com'
        };
        
        const welcomeHTML = await emailTemplateService.generateWelcomeEmail(welcomeUser);
        await fs.writeFile('test-welcome-email.html', welcomeHTML);
        console.log('✅ Email de bienvenue généré et sauvegardé dans test-welcome-email.html');

        // Test 2: Email de nouveau code d'accès
        console.log('\n📧 Test 2: Email de nouveau code d\'accès');
        const accessData = {
            guestName: 'Jean Dupont',
            propertyName: 'Appartement Paris',
            accessCode: '123456',
            startDate: new Date(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 jours
            ownerName: 'Marie Martin'
        };
        
        const accessHTML = await emailTemplateService.generateNewAccessEmail(accessData);
        await fs.writeFile('test-access-email.html', accessHTML);
        console.log('✅ Email de nouveau code d\'accès généré et sauvegardé dans test-access-email.html');

        console.log('\n🎉 Tous les tests passent !');
        console.log('\n📁 Fichiers générés :');
        console.log('   - test-welcome-email.html');
        console.log('   - test-access-email.html');
        console.log('\n💡 Ouvrez ces fichiers dans votre navigateur pour voir le résultat !');

    } catch (error) {
        console.error('❌ Erreur lors du test des templates:', error);
    }
}

// Exécuter le test
testEmailTemplates(); 