const prisma = require('../config/database');
const { createEndpoint } = require('../services/webhookService');

async function listEndpoints(req, res) {
  const items = await prisma.webhookEndpoint.findMany({ where: { ownerId: req.user?.userId || null } });
  res.json({ success: true, items });
}

async function addEndpoint(req, res) {
  const ownerId = req.user?.userId || null;
  const { url, secret, events } = req.body || {};
  const created = await createEndpoint({ url, secret, events, ownerId });
  res.status(201).json({ success: true, endpoint: { ...created, secret: undefined } });
}

async function removeEndpoint(req, res) {
  const ownerId = req.user?.userId || null;
  const { id } = req.params;
  await prisma.webhookEndpoint.deleteMany({ where: { id, ownerId } });
  res.json({ success: true });
}

module.exports = { listEndpoints, addEndpoint, removeEndpoint };

