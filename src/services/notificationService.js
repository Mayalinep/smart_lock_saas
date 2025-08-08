const nodemailer = require('nodemailer');
const emailTemplateService = require('./emailTemplateService');

function createTransport() {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_SECURE,
  } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    return null; // fallback console
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: String(SMTP_SECURE || '').toLowerCase() === 'true',
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

const transporter = createTransport();
const fromAddress = process.env.SMTP_FROM || 'no-reply@smartlocks.local';

async function sendEmail({ to, subject, text, html }) {
  if (!to) return;
  if (!transporter) {
    console.log('[Email DRY-RUN]', { to, subject, text });
    return;
  }
  await transporter.sendMail({ from: fromAddress, to, subject, text, html });
}

// Template de base pour fallback
function baseTemplate(title, body) {
  return `<!doctype html><html><body style="font-family:Arial,sans-serif;">
  <h2>${title}</h2>
  <div style="font-size:14px;line-height:1.5;">${body}</div>
  <hr/><div style="color:#888;font-size:12px;">Smart Lock SaaS</div>
  </body></html>`;
}

/**
 * Envoie l'email de bienvenue à un nouvel utilisateur
 */
async function notifyWelcome(user) {
  try {
    const subject = `Bienvenue sur Smart Lock SaaS, ${user.firstName || 'Utilisateur'} !`;
    const html = await emailTemplateService.generateWelcomeEmail(user);
    const text = `Bienvenue sur Smart Lock SaaS ! Votre compte a été créé avec succès.`;
    
    await sendEmail({ to: user.email, subject, text, html });
    console.log(`✅ Email de bienvenue envoyé à ${user.email}`);
  } catch (error) {
    console.error(`❌ Erreur lors de l'envoi de l'email de bienvenue:`, error);
    // Fallback vers le template simple
    const html = baseTemplate('Bienvenue', `Bienvenue sur Smart Lock SaaS ! Votre compte a été créé avec succès.`);
    await sendEmail({ to: user.email, subject: 'Bienvenue sur Smart Lock SaaS', text: 'Bienvenue !', html });
  }
}

/**
 * Notifie un utilisateur qu'il a reçu un nouveau code d'accès
 */
async function notifyNewAccess(accessData) {
  try {
    const subject = `Nouveau code d'accès - ${accessData.propertyName}`;
    const html = await emailTemplateService.generateNewAccessEmail(accessData);
    const text = `Vous avez reçu un nouveau code d'accès pour ${accessData.propertyName}: ${accessData.accessCode}`;
    
    await sendEmail({ to: accessData.guestEmail, subject, text, html });
    console.log(`✅ Email de nouveau code d'accès envoyé à ${accessData.guestEmail}`);
  } catch (error) {
    console.error(`❌ Erreur lors de l'envoi de l'email de nouveau code:`, error);
    // Fallback vers le template simple
    const html = baseTemplate('Nouveau code d\'accès', `Vous avez reçu un nouveau code d'accès pour <b>${accessData.propertyName}</b>: <b>${accessData.accessCode}</b>`);
    await sendEmail({ to: accessData.guestEmail, subject: `Nouveau code d'accès - ${accessData.propertyName}`, text: 'Nouveau code d\'accès', html });
  }
}

/**
 * Notifie la révocation d'un accès
 */
async function notifyAccessRevoked({ ownerEmail, userEmail, propertyName, code, reason, guestName, ownerName }) {
  try {
    const subject = `Accès révoqué - ${propertyName}`;
    const revocationData = {
      guestName: guestName || 'Utilisateur',
      propertyName,
      ownerName: ownerName || 'Propriétaire',
      reason: reason || 'Révocation manuelle'
    };
    
    const html = await emailTemplateService.generateRevocationEmail(revocationData);
    const text = `L'accès pour "${propertyName}" a été révoqué. Raison: ${reason || 'N/A'}.`;
    
    await Promise.all([
      sendEmail({ to: ownerEmail, subject, text, html }),
      userEmail ? sendEmail({ to: userEmail, subject, text, html }) : Promise.resolve(),
    ]);
    console.log(`✅ Email de révocation envoyé pour ${propertyName}`);
  } catch (error) {
    console.error(`❌ Erreur lors de l'envoi de l'email de révocation:`, error);
    // Fallback vers le template simple
    const html = baseTemplate('Accès révoqué', `L'accès pour <b>${propertyName}</b> a été révoqué.<br/>Raison: ${reason || 'N/A'}.`);
    await Promise.all([
      sendEmail({ to: ownerEmail, subject: `Accès révoqué - ${propertyName}`, text: 'Accès révoqué', html }),
      userEmail ? sendEmail({ to: userEmail, subject: `Accès révoqué - ${propertyName}`, text: 'Accès révoqué', html }) : Promise.resolve(),
    ]);
  }
}

/**
 * Notifie une alerte de batterie faible
 */
async function notifyBatteryLow({ ownerEmail, propertyName, batteryLevel, lockId, lastUpdate }) {
  try {
    const subject = `Alerte batterie faible - ${propertyName}`;
    const batteryData = {
      propertyName,
      batteryLevel,
      lockId,
      lastUpdate: lastUpdate || new Date()
    };
    
    const html = await emailTemplateService.generateBatteryLowEmail(batteryData);
    const text = `La batterie de la serrure pour "${propertyName}" est faible (${batteryLevel}%).`;
    
    await sendEmail({ to: ownerEmail, subject, text, html });
    console.log(`✅ Email d'alerte batterie envoyé pour ${propertyName}`);
  } catch (error) {
    console.error(`❌ Erreur lors de l'envoi de l'email d'alerte batterie:`, error);
    // Fallback vers le template simple
    const html = baseTemplate('Alerte batterie faible', `La batterie de la serrure pour <b>${propertyName}</b> est faible (<b>${batteryLevel}%</b>).`);
    await sendEmail({ to: ownerEmail, subject: `Alerte batterie faible - ${propertyName}`, text: 'Alerte batterie faible', html });
  }
}

/**
 * Notifie une tentative d'accès échouée
 */
async function notifyExpiredAttempt({ ownerEmail, propertyName, attemptTime, ipAddress, userAgent }) {
  try {
    const subject = `Tentative d'accès échouée - ${propertyName}`;
    const securityData = {
      propertyName,
      attemptTime: attemptTime || new Date(),
      ipAddress: ipAddress || 'Inconnu',
      userAgent: userAgent || 'Inconnu'
    };
    
    const html = await emailTemplateService.generateFailedAccessEmail(securityData);
    const text = `Une tentative d'accès avec un code expiré a été détectée sur "${propertyName}".`;
    
    await sendEmail({ to: ownerEmail, subject, text, html });
    console.log(`✅ Email de tentative échouée envoyé pour ${propertyName}`);
  } catch (error) {
    console.error(`❌ Erreur lors de l'envoi de l'email de tentative échouée:`, error);
    // Fallback vers le template simple
    const html = baseTemplate('Tentative avec code expiré', `Une tentative d'accès avec un code <b>expiré</b> a été détectée sur <b>${propertyName}</b>.`);
    await sendEmail({ to: ownerEmail, subject: `Tentative avec code expiré - ${propertyName}`, text: 'Tentative avec code expiré', html });
  }
}

module.exports = {
  notifyWelcome,
  notifyNewAccess,
  notifyAccessRevoked,
  notifyBatteryLow,
  notifyExpiredAttempt,
};

