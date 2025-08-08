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

function baseTemplate(title, body) {
  return `<!doctype html><html><body style="font-family:Arial,sans-serif;">
  <h2>${title}</h2>
  <div style="font-size:14px;line-height:1.5;">${body}</div>
  <hr/><div style="color:#888;font-size:12px;">Smart Lock SaaS</div>
  </body></html>`;
}

async function notifyAccessRevoked({ ownerEmail, userEmail, propertyName, code, reason }) {
  const subject = `Accès révoqué - ${propertyName}`;
  const text = `L'accès pour "${propertyName}" a été révoqué. Raison: ${reason || 'N/A'}.`;
  const html = baseTemplate('Accès révoqué', `L'accès pour <b>${propertyName}</b> a été révoqué.<br/>Raison: ${reason || 'N/A'}.`);
  await Promise.all([
    sendEmail({ to: ownerEmail, subject, text, html }),
    userEmail ? sendEmail({ to: userEmail, subject, text, html }) : Promise.resolve(),
  ]);
}

async function notifyBatteryLow({ ownerEmail, propertyName, batteryLevel }) {
  const subject = `Alerte batterie faible - ${propertyName}`;
  const text = `La batterie de la serrure pour "${propertyName}" est faible (${batteryLevel}%).`;
  const html = baseTemplate('Alerte batterie faible', `La batterie de la serrure pour <b>${propertyName}</b> est faible (<b>${batteryLevel}%</b>).`);
  await sendEmail({ to: ownerEmail, subject, text, html });
}

async function notifyExpiredAttempt({ ownerEmail, propertyName }) {
  const subject = `Tentative avec code expiré - ${propertyName}`;
  const text = `Une tentative d'accès avec un code expiré a été détectée sur "${propertyName}".`;
  const html = baseTemplate('Tentative avec code expiré', `Une tentative d'accès avec un code <b>expiré</b> a été détectée sur <b>${propertyName}</b>.`);
  await sendEmail({ to: ownerEmail, subject, text, html });
}

module.exports = {
  notifyAccessRevoked,
  notifyBatteryLow,
  notifyExpiredAttempt,
};

