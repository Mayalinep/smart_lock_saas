const express = require('express');
const PropertyController = require('../controllers/propertyController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateRequest, createPropertySchema, updatePropertySchema, cuidParamSchema } = require('../validators/schemas');

const router = express.Router();

/**
 * Routes de gestion des propriétés
 * Toutes les routes nécessitent une authentification
 */

// Appliquer l'authentification à toutes les routes
router.use(authenticate);

// Création d'une nouvelle propriété (avec validation Zod)
router.post('/', validateRequest(createPropertySchema), PropertyController.createProperty);

// Récupération des propriétés de l'utilisateur
router.get('/', PropertyController.getUserProperties);

// Récupération d'une propriété par ID (avec validation ID)
router.get('/:id', validateRequest(cuidParamSchema, 'params'), PropertyController.getPropertyById);

// Mise à jour d'une propriété (avec validation Zod)
router.put('/:id', 
  validateRequest(cuidParamSchema, 'params'), 
  validateRequest(updatePropertySchema), 
  PropertyController.updateProperty);

// Suppression d'une propriété
router.delete('/:id', PropertyController.deleteProperty);

// Activation/Désactivation d'une propriété
router.patch('/:id/status', PropertyController.togglePropertyStatus);

module.exports = router; 