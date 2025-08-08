const { Queue, Worker, QueueEvents, JobsOptions } = require('bullmq');
const IORedis = require('ioredis');
const { notifyAccessRevoked, notifyBatteryLow } = require('../services/notificationService');

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');

const emailQueue = new Queue('email', { connection });
const emailQueueEvents = new QueueEvents('email', { connection });

// Worker
const worker = new Worker('email', async (job) => {
  const { type, payload } = job.data || {};
  if (type === 'accessRevoked') {
    await notifyAccessRevoked(payload);
  } else if (type === 'batteryLow') {
    await notifyBatteryLow(payload);
  }
}, {
  connection,
  concurrency: 5,
});

// Retry avec backoff exponentiel
const defaultJobOptions = /** @type {JobsOptions} */({
  attempts: 5,
  backoff: { type: 'exponential', delay: 2000 },
  removeOnComplete: 1000,
  removeOnFail: 1000,
});

async function enqueueAccessRevoked(payload) {
  await emailQueue.add('accessRevoked', { type: 'accessRevoked', payload }, defaultJobOptions);
}

async function enqueueBatteryLow(payload) {
  await emailQueue.add('batteryLow', { type: 'batteryLow', payload }, defaultJobOptions);
}

module.exports = {
  emailQueue,
  emailQueueEvents,
  enqueueAccessRevoked,
  enqueueBatteryLow,
};

