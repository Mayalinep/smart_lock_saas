const fs = require('fs').promises;
const path = require('path');
const Handlebars = require('handlebars');

/**
 * Service pour gérer les templates email HTML
 */
class EmailTemplateService {
    constructor() {
        this.templates = {};
        this.templatePath = path.join(__dirname, '../templates/emails');
    }

    /**
     * Charge un template depuis le fichier
     * @param {string} templateName - Nom du template
     * @returns {Promise<string>} Contenu du template
     */
    async loadTemplate(templateName) {
        try {
            const templatePath = path.join(this.templatePath, templateName, `${templateName}.html`);
            const templateContent = await fs.readFile(templatePath, 'utf8');
            return templateContent;
        } catch (error) {
            console.error(`❌ Erreur lors du chargement du template ${templateName}:`, error);
            throw new Error(`Template ${templateName} non trouvé`);
        }
    }

    /**
     * Compile un template avec Handlebars
     * @param {string} templateName - Nom du template
     * @returns {Promise<Function>} Template compilé
     */
    async getCompiledTemplate(templateName) {
        if (this.templates[templateName]) {
            return this.templates[templateName];
        }

        const templateContent = await this.loadTemplate(templateName);
        const compiledTemplate = Handlebars.compile(templateContent);
        this.templates[templateName] = compiledTemplate;
        
        return compiledTemplate;
    }

    /**
     * Génère le contenu HTML d'un email
     * @param {string} templateName - Nom du template
     * @param {Object} data - Données pour le template
     * @returns {Promise<string>} HTML généré
     */
    async generateEmailHTML(templateName, data) {
        try {
            const template = await this.getCompiledTemplate(templateName);
            const html = template(data);
            return html;
        } catch (error) {
            console.error(`❌ Erreur lors de la génération du template ${templateName}:`, error);
            throw error;
        }
    }

    /**
     * Génère l'email de bienvenue
     * @param {Object} user - Données utilisateur
     * @returns {Promise<string>} HTML de l'email
     */
    async generateWelcomeEmail(user) {
        const data = {
            firstName: user.firstName || 'Utilisateur',
            email: user.email,
            dashboardUrl: process.env.DASHBOARD_URL || 'https://smart-lock-saas.vercel.app',
            unsubscribeUrl: `${process.env.API_URL || 'https://smart-lock-saas.vercel.app'}/api/email/unsubscribe?email=${encodeURIComponent(user.email)}`
        };

        return this.generateEmailHTML('welcome', data);
    }

    /**
     * Génère l'email de nouveau code d'accès
     * @param {Object} accessData - Données d'accès
     * @returns {Promise<string>} HTML de l'email
     */
    async generateNewAccessEmail(accessData) {
        const data = {
            guestName: accessData.guestName,
            propertyName: accessData.propertyName,
            accessCode: accessData.accessCode,
            startDate: new Date(accessData.startDate).toLocaleDateString('fr-FR'),
            endDate: new Date(accessData.endDate).toLocaleDateString('fr-FR'),
            ownerName: accessData.ownerName,
            dashboardUrl: process.env.DASHBOARD_URL || 'https://smart-lock-saas.vercel.app'
        };

        return this.generateEmailHTML('access', data);
    }

    /**
     * Génère l'email de révocation d'accès
     * @param {Object} revocationData - Données de révocation
     * @returns {Promise<string>} HTML de l'email
     */
    async generateRevocationEmail(revocationData) {
        const data = {
            guestName: revocationData.guestName,
            propertyName: revocationData.propertyName,
            revocationDate: new Date().toLocaleDateString('fr-FR'),
            ownerName: revocationData.ownerName,
            reason: revocationData.reason || 'Révocation manuelle',
            dashboardUrl: process.env.DASHBOARD_URL || 'https://smart-lock-saas.vercel.app'
        };

        return this.generateEmailHTML('revocation', data);
    }

    /**
     * Génère l'email d'alerte batterie faible
     * @param {Object} batteryData - Données de batterie
     * @returns {Promise<string>} HTML de l'email
     */
    async generateBatteryLowEmail(batteryData) {
        const data = {
            propertyName: batteryData.propertyName,
            batteryLevel: batteryData.batteryLevel,
            lockId: batteryData.lockId,
            lastUpdate: new Date(batteryData.lastUpdate).toLocaleString('fr-FR'),
            dashboardUrl: process.env.DASHBOARD_URL || 'https://smart-lock-saas.vercel.app'
        };

        return this.generateEmailHTML('battery', data);
    }

    /**
     * Génère l'email de tentative d'accès échouée
     * @param {Object} securityData - Données de sécurité
     * @returns {Promise<string>} HTML de l'email
     */
    async generateFailedAccessEmail(securityData) {
        const data = {
            propertyName: securityData.propertyName,
            attemptTime: new Date(securityData.attemptTime).toLocaleString('fr-FR'),
            ipAddress: securityData.ipAddress,
            userAgent: securityData.userAgent,
            dashboardUrl: process.env.DASHBOARD_URL || 'https://smart-lock-saas.vercel.app'
        };

        return this.generateEmailHTML('security', data);
    }
}

module.exports = new EmailTemplateService(); 