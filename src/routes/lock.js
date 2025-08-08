// src/routes/lock.js

const express = require('express');
const LockController = require('../controllers/lockController');
const { authenticate } = require('../middleware/auth');
const { validateRequest, propertyIdParamSchema, lockEventsQuerySchema } = require('../validators/schemas');

const router = express.Router();

/**
 * Routes de gestion des serrures
 * Toutes les routes nécessitent une authentification
 */
router.use(authenticate);

// Récupération du statut d'une serrure pour une propriété
router.get('/status/:propertyId', 
  validateRequest(propertyIdParamSchema, 'params'), 
  LockController.getLockStatus
);

// Alias pour compatibilité: /lock-status/:propertyId
router.get('/lock-status/:propertyId', 
  validateRequest(propertyIdParamSchema, 'params'), 
  LockController.getLockStatus
);

// Récupération de l'historique des événements d'une serrure
router.get('/events/:propertyId', 
  validateRequest(propertyIdParamSchema, 'params'),
  validateRequest(lockEventsQuerySchema, 'query'),
  LockController.getLockEvents
);

// Synchronisation forcée d'une serrure (reprogrammation de tous les codes actifs)
router.post('/sync/:propertyId', 
  validateRequest(propertyIdParamSchema, 'params'), 
  LockController.syncLock
);

module.exports = router; 