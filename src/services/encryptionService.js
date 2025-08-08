const CryptoJS = require('crypto-js');

/**
 * Service de chiffrement pour les secrets sensibles
 * Utilise AES-256-GCM pour un chiffrement sécurisé
 */
class EncryptionService {
    constructor() {
        this.encryptionKey = process.env.ENCRYPTION_KEY;
        
        if (!this.encryptionKey) {
            console.warn('⚠️ ENCRYPTION_KEY non définie - les secrets ne seront pas chiffrés');
            this.encryptionKey = 'default_key_for_development_only';
        }
        
        // Validation de la clé
        if (this.encryptionKey.length < 32) {
            throw new Error('ENCRYPTION_KEY doit faire au moins 32 caractères');
        }
    }

    /**
     * Chiffre une donnée sensible
     * @param {string} data - Donnée à chiffrer
     * @returns {string} Donnée chiffrée (format: iv:encryptedData)
     */
    encrypt(data) {
        try {
            if (!data) return null;
            
            // Générer un IV aléatoire
            const iv = CryptoJS.lib.WordArray.random(16);
            
            // Chiffrer avec AES-256
            const encrypted = CryptoJS.AES.encrypt(data, this.encryptionKey, {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });
            
            // Retourner au format iv:encryptedData
            return iv.toString() + ':' + encrypted.toString();
        } catch (error) {
            console.error('❌ Erreur lors du chiffrement:', error);
            throw new Error('Échec du chiffrement');
        }
    }

    /**
     * Déchiffre une donnée chiffrée
     * @param {string} encryptedData - Donnée chiffrée (format: iv:encryptedData)
     * @returns {string} Donnée déchiffrée
     */
    decrypt(encryptedData) {
        try {
            if (!encryptedData) return null;
            
            // Séparer IV et données chiffrées
            const parts = encryptedData.split(':');
            if (parts.length !== 2) {
                throw new Error('Format de données chiffrées invalide');
            }
            
            const iv = CryptoJS.enc.Hex.parse(parts[0]);
            const encrypted = parts[1];
            
            // Déchiffrer
            const decrypted = CryptoJS.AES.decrypt(encrypted, this.encryptionKey, {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });
            
            return decrypted.toString(CryptoJS.enc.Utf8);
        } catch (error) {
            console.error('❌ Erreur lors du déchiffrement:', error);
            throw new Error('Échec du déchiffrement');
        }
    }

    /**
     * Chiffre un objet JSON
     * @param {Object} obj - Objet à chiffrer
     * @returns {string} Objet chiffré
     */
    encryptObject(obj) {
        if (!obj) return null;
        const jsonString = JSON.stringify(obj);
        return this.encrypt(jsonString);
    }

    /**
     * Déchiffre un objet JSON
     * @param {string} encryptedData - Données chiffrées
     * @returns {Object} Objet déchiffré
     */
    decryptObject(encryptedData) {
        if (!encryptedData) return null;
        const jsonString = this.decrypt(encryptedData);
        return JSON.parse(jsonString);
    }

    /**
     * Vérifie si les données sont chiffrées
     * @param {string} data - Données à vérifier
     * @returns {boolean} True si chiffrées
     */
    isEncrypted(data) {
        if (!data) return false;
        return data.includes(':') && data.split(':').length === 2;
    }

    /**
     * Génère une nouvelle clé de chiffrement
     * @returns {string} Nouvelle clé (32 bytes)
     */
    static generateKey() {
        return CryptoJS.lib.WordArray.random(32).toString();
    }

    /**
     * Valide une clé de chiffrement
     * @param {string} key - Clé à valider
     * @returns {boolean} True si valide
     */
    static validateKey(key) {
        return key && key.length >= 32;
    }
}

module.exports = new EncryptionService(); 