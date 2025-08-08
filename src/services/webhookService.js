const crypto = require('crypto');
const prisma = require('../config/database');

function signPayload(secret, timestampSeconds, rawBody) {
  const payload = `${timestampSeconds}.${rawBody}`;
  const digest = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return `sha256=${digest}`;
}

async function listActiveEndpoints(ownerId) {
  return prisma.webhookEndpoint.findMany({
    where: { isActive: true, OR: [{ ownerId: ownerId || undefined }, { ownerId: null }] }
  });
}

async function createEndpoint({ url, secret, events, ownerId }) {
  return prisma.webhookEndpoint.create({ data: { url, secret, events: events || null, ownerId: ownerId || null } });
}

async function deleteEndpoint(id, ownerId) {
  return prisma.webhookEndpoint.deleteMany({ where: { id, OR: [{ ownerId }, { ownerId: null }] } });
}

async function dispatchEvent(event, ownerId) {
  const { enqueueWebhook } = require('../queues/webhookQueue');
  const endpoints = await listActiveEndpoints(ownerId);
  const jobs = endpoints.map((ep) => enqueueWebhook({ endpointId: ep.id, url: ep.url, secret: ep.secret, event }));
  await Promise.all(jobs);
}

module.exports = {
  signPayload,
  listActiveEndpoints,
  createEndpoint,
  deleteEndpoint,
  dispatchEvent,
};

