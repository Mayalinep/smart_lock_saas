const express = require('express');
const PropertyController = require('../controllers/propertyController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * Routes de gestion des propriétés
 * Toutes les routes nécessitent une authentification
 */

// Appliquer l'authentification à toutes les routes
router.use(authenticate);

// Création d'une nouvelle propriété
router.post('/', PropertyController.createProperty);

// Récupération des propriétés de l'utilisateur
router.get('/', PropertyController.getUserProperties);

// Récupération d'une propriété par ID
router.get('/:id', PropertyController.getPropertyById);

// Mise à jour d'une propriété
router.put('/:id', PropertyController.updateProperty);

// Suppression d'une propriété
router.delete('/:id', PropertyController.deleteProperty);

// Activation/Désactivation d'une propriété
router.patch('/:id/status', PropertyController.togglePropertyStatus);

module.exports = router; 