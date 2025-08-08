const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { validateRequest } = require('../validators/schemas');
const { z } = require('zod');
const { listEndpoints, addEndpoint, removeEndpoint } = require('../controllers/webhookController');

const createWebhookSchema = z.object({
  url: z.string().url(),
  secret: z.string().min(16),
  events: z.string().optional(), // simple CSV pour MVP
});

const idParamSchema = z.object({ id: z.string().cuid() });

router.use(authenticate);
router.get('/', listEndpoints);
router.post('/', validateRequest(createWebhookSchema, 'body'), addEndpoint);
router.delete('/:id', validateRequest(idParamSchema, 'params'), removeEndpoint);

module.exports = router;

