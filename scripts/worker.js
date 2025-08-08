// Lance le worker BullMQ pour la queue email
require('dotenv').config();
const { emailQueueEvents } = require('../src/queues/emailQueue');
console.log('📨 Email worker démarré');

emailQueueEvents.on('completed', ({ jobId }) => {
  console.log('✅ Email job terminé:', jobId);
});
emailQueueEvents.on('failed', ({ jobId, failedReason }) => {
  console.error('❌ Email job échoué:', jobId, failedReason);
});

process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));

