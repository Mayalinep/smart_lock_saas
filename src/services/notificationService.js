const nodemailer = require('nodemailer');

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

async function notifyAccessRevoked({ ownerEmail, userEmail, propertyName, code, reason }) {
  const subject = `Accès révoqué - ${propertyName}`;
  const text = `Bonjour,\n\nL'accès pour la propriété "${propertyName}" a été révoqué.\nRaison: ${reason || 'N/A'}\nCode: ${code ? '****' : 'N/A'}\n\n-- Smart Lock SaaS`;
  await Promise.all([
    sendEmail({ to: ownerEmail, subject, text }),
    userEmail ? sendEmail({ to: userEmail, subject, text }) : Promise.resolve(),
  ]);
}

async function notifyBatteryLow({ ownerEmail, propertyName, batteryLevel }) {
  const subject = `Alerte batterie faible - ${propertyName}`;
  const text = `Bonjour,\n\nLa batterie de la serrure pour "${propertyName}" est faible (${batteryLevel}%).\nMerci de prévoir un remplacement.\n\n-- Smart Lock SaaS`;
  await sendEmail({ to: ownerEmail, subject, text });
}

module.exports = {
  notifyAccessRevoked,
  notifyBatteryLow,
};

