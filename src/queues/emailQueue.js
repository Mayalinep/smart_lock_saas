const isTest = process.env.NODE_ENV === 'test';

if (isTest || !process.env.REDIS_URL) {
  // No-op en test ou sans Redis
  async function noop() {}
  module.exports = {
    emailQueue: null,
    emailQueueEvents: null,
    enqueueAccessRevoked: noop,
    enqueueBatteryLow: noop,
    shutdownQueues: noop,
  };
} else {
  const { Queue, Worker, QueueEvents, JobsOptions } = require('bullmq');
  const metrics = require('../services/metrics');
  const IORedis = require('ioredis');
  const { notifyAccessRevoked, notifyBatteryLow, notifyExpiredAttempt } = require('../services/notificationService');

  const connection = new IORedis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });

  const emailQueue = new Queue('email', { connection });
  const emailQueueEvents = new QueueEvents('email', { connection });

  // Worker
  const worker = new Worker('email', async (job) => {
    const { type, payload } = job.data || {};
    if (type === 'accessRevoked') {
      await notifyAccessRevoked(payload);
      try { metrics.incEmailSent('accessRevoked'); } catch (_) {}
    } else if (type === 'batteryLow') {
      await notifyBatteryLow(payload);
      try { metrics.incEmailSent('batteryLow'); } catch (_) {}
    } else if (type === 'expiredAttempt') {
      await notifyExpiredAttempt(payload);
      try { metrics.incEmailSent('expiredAttempt'); } catch (_) {}
    }
  }, {
    connection,
    concurrency: 5,
  });

  worker.on('failed', (job) => {
    const t = job?.data?.type || 'unknown';
    try { metrics.incEmailFailed(t); } catch (_) {}
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
  async function enqueueExpiredAttempt(payload) {
    await emailQueue.add('expiredAttempt', { type: 'expiredAttempt', payload }, defaultJobOptions);
  }

  async function shutdownQueues() {
    try { await worker?.close(); } catch (_) {}
    try { await emailQueueEvents?.close(); } catch (_) {}
    try { await emailQueue?.close(); } catch (_) {}
    try { await connection?.quit(); } catch (_) {}
  }

  module.exports = {
    emailQueue,
    emailQueueEvents,
    enqueueAccessRevoked,
    enqueueBatteryLow,
    enqueueExpiredAttempt,
    shutdownQueues,
  };
}

