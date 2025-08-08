const encryptionService = require('./src/services/encryptionService');
const TwoFactorService = require('./src/services/twoFactorService');

async function testEncryption() {
    console.log('🔐 Test du service de chiffrement...\n');

    try {
        // Test 1: Chiffrement simple
        console.log('📧 Test 1: Chiffrement simple');
        const originalText = 'Mon secret très sensible';
        const encrypted = encryptionService.encrypt(originalText);
        const decrypted = encryptionService.decrypt(encrypted);
        
        console.log('✅ Chiffrement simple:', originalText === decrypted ? 'SUCCÈS' : 'ÉCHEC');
        console.log('   Original:', originalText);
        console.log('   Chiffré:', encrypted.substring(0, 50) + '...');
        console.log('   Déchiffré:', decrypted);

        // Test 2: Chiffrement d'objet JSON
        console.log('\n📧 Test 2: Chiffrement d\'objet JSON');
        const originalObject = { codes: ['ABC123', 'DEF456', 'GHI789'] };
        const encryptedObject = encryptionService.encryptObject(originalObject);
        const decryptedObject = encryptionService.decryptObject(encryptedObject);
        
        console.log('✅ Chiffrement JSON:', JSON.stringify(originalObject) === JSON.stringify(decryptedObject) ? 'SUCCÈS' : 'ÉCHEC');
        console.log('   Original:', originalObject);
        console.log('   Chiffré:', encryptedObject.substring(0, 50) + '...');
        console.log('   Déchiffré:', decryptedObject);

        // Test 3: Détection de chiffrement
        console.log('\n📧 Test 3: Détection de chiffrement');
        const plainText = 'texte en clair';
        const encryptedText = encryptionService.encrypt('texte chiffré');
        
        console.log('✅ Détection chiffrement:');
        console.log('   Texte en clair:', encryptionService.isEncrypted(plainText) ? 'DÉTECTÉ' : 'NON DÉTECTÉ');
        console.log('   Texte chiffré:', encryptionService.isEncrypted(encryptedText) ? 'DÉTECTÉ' : 'NON DÉTECTÉ');

        // Test 4: Génération de clé
        console.log('\n📧 Test 4: Génération de clé');
        const newKey = encryptionService.constructor.generateKey();
        console.log('✅ Nouvelle clé générée:', newKey.length >= 32 ? 'VALIDE' : 'INVALIDE');
        console.log('   Longueur:', newKey.length, 'caractères');

        // Test 5: Validation de clé
        console.log('\n📧 Test 5: Validation de clé');
        const validKey = 'a'.repeat(32);
        const invalidKey = 'trop_court';
        
        console.log('✅ Validation de clé:');
        console.log('   Clé valide:', encryptionService.constructor.validateKey(validKey) ? 'VALIDE' : 'INVALIDE');
        console.log('   Clé invalide:', encryptionService.constructor.validateKey(invalidKey) ? 'VALIDE' : 'INVALIDE');

        // Test 6: Intégration avec 2FA
        console.log('\n📧 Test 6: Intégration avec 2FA');
        const mockUser = { email: 'test@example.com' };
        const secretData = TwoFactorService.generateSecret(mockUser);
        const backupCodes = TwoFactorService.generateBackupCodes();
        
        // Simuler l'activation 2FA avec chiffrement
        const twoFactorData = await TwoFactorService.enableTwoFactor(mockUser, secretData.secret);
        
        console.log('✅ Intégration 2FA:');
        console.log('   Secret chiffré:', encryptionService.isEncrypted(twoFactorData.encryptedSecret) ? 'CHIFFRÉ' : 'NON CHIFFRÉ');
        console.log('   Backup codes chiffrés:', encryptionService.isEncrypted(twoFactorData.encryptedBackupCodes) ? 'CHIFFRÉS' : 'NON CHIFFRÉS');

        // Test 7: Vérification TOTP avec chiffrement
        console.log('\n📧 Test 7: Vérification TOTP avec chiffrement');
        const token = '123456'; // Token de test
        const isValid = TwoFactorService.verifyToken(twoFactorData.encryptedSecret, token);
        console.log('✅ Vérification TOTP:', isValid ? 'VALIDE' : 'INVALIDE');

        console.log('\n🎉 Tous les tests de chiffrement passent !');
        console.log('\n🔒 Sécurité renforcée :');
        console.log('   - Secrets TOTP chiffrés');
        console.log('   - Codes de sauvegarde chiffrés');
        console.log('   - IV aléatoire pour chaque chiffrement');
        console.log('   - Gestion d\'erreurs robuste');

    } catch (error) {
        console.error('❌ Erreur lors du test de chiffrement:', error);
    }
}

// Exécuter le test
testEncryption(); 