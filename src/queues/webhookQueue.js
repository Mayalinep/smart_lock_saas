const isTest = process.env.NODE_ENV === 'test';

if (isTest || !process.env.REDIS_URL) {
  async function noop() {}
  module.exports = {
    webhookQueue: null,
    enqueueWebhook: async () => {},
    shutdownWebhookQueues: noop,
  };
} else {
  const { Queue, Worker, QueueEvents, JobsOptions } = require('bullmq');
  const IORedis = require('ioredis');
  const axios = require('axios');
  const metrics = require('../services/metrics');
  const { signPayload } = require('../services/webhookService');

  const connection = new IORedis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });

  const webhookQueue = new Queue('webhooks', { connection });
  const webhookQueueEvents = new QueueEvents('webhooks', { connection });

  const defaultJobOptions = /** @type {JobsOptions} */({
    attempts: 5,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 1000,
    removeOnFail: 1000,
  });

  async function enqueueWebhook(payload) {
    await webhookQueue.add('deliver', payload, defaultJobOptions);
  }

  const worker = new Worker('webhooks', async (job) => {
    const start = Date.now();
    const { url, secret, event } = job.data || {};
    const rawBody = JSON.stringify(event);
    const ts = Math.floor(Date.now() / 1000);
    const signature = signPayload(secret, ts, rawBody);
    try {
      const res = await axios.post(url, rawBody, {
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Id': event.id,
          'X-Webhook-Timestamp': String(ts),
          'X-Webhook-Signature': signature,
          'Idempotency-Key': event.id,
        },
        timeout: 10000,
      });
      try {
        metrics.incWebhookSent(event.type);
        metrics.observeWebhookDelivery(event.type, String(res.status), (Date.now() - start) / 1000);
      } catch (_) {}
    } catch (e) {
      try {
        metrics.incWebhookFailed(event.type);
        metrics.observeWebhookDelivery(event.type, 'error', (Date.now() - start) / 1000);
      } catch (_) {}
      throw e;
    }
  }, { connection, concurrency: 5 });

  function shutdownWebhookQueues() {
    return Promise.all([
      webhookQueue?.close(),
      webhookQueueEvents?.close(),
      worker?.close(),
      connection?.quit?.(),
    ]).catch(() => {});
  }

  module.exports = { webhookQueue, enqueueWebhook, shutdownWebhookQueues };
}

