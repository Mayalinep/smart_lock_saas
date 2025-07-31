const express = require('express');
const AccessController = require('../controllers/accessController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateRequest, createAccessSchema, accessIdParamSchema, propertyIdParamSchema } = require('../validators/schemas');

const router = express.Router();

/**
 * Routes de gestion des accès
 */

// Route publique pour validation des codes d'accès (utilisée par les serrures)
router.post('/validate', AccessController.validateAccessCode);

// Toutes les autres routes nécessitent une authentification
router.use(authenticate);

// Création d'un nouvel accès (avec validation Zod complète)
router.post('/', validateRequest(createAccessSchema), AccessController.createAccess);

// Récupération des accès de l'utilisateur connecté
router.get('/my-accesses', AccessController.getUserAccesses);

// Récupération des accès pour une propriété spécifique (avec validation ID)
router.get('/property/:propertyId', 
  validateRequest(propertyIdParamSchema, 'params'), 
  AccessController.getPropertyAccesses);

// Récupération de l'historique complet d'une propriété (avec validation ID)
router.get('/property/:propertyId/history', 
  validateRequest(propertyIdParamSchema, 'params'), 
  AccessController.getPropertyAccessHistory);

// Récupération du statut de serrure pour une propriété (avec validation ID)
router.get('/lock-status/:propertyId', 
  validateRequest(propertyIdParamSchema, 'params'), 
  AccessController.getLockStatus);

// Récupération d'un accès par ID
router.get('/:id', AccessController.getAccessById);

// Mise à jour d'un accès
router.put('/:id', AccessController.updateAccess);

// Suppression d'un accès
router.delete('/:accessId', AccessController.deleteAccess);

// Route admin pour nettoyer les accès expirés
router.post('/cleanup', authorize(['ADMIN', 'SUPER_ADMIN']), AccessController.cleanupExpiredAccesses);

module.exports = router; 