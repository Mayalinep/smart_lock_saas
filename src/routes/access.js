const express = require('express');
const AccessController = require('../controllers/accessController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * Routes de gestion des accès
 */

// Route publique pour validation des codes d'accès (utilisée par les serrures)
router.post('/validate', AccessController.validateAccessCode);

// Toutes les autres routes nécessitent une authentification
router.use(authenticate);

// Création d'un nouvel accès
router.post('/', AccessController.createAccess);

// Récupération des accès de l'utilisateur connecté
router.get('/my-accesses', AccessController.getUserAccesses);

// Récupération des accès pour une propriété spécifique
router.get('/property/:propertyId', AccessController.getPropertyAccesses);

// Récupération d'un accès par ID
router.get('/:id', AccessController.getAccessById);

// Mise à jour d'un accès
router.put('/:id', AccessController.updateAccess);

// Révocation d'un accès
router.delete('/:id', AccessController.revokeAccess);

// Route admin pour nettoyer les accès expirés
router.post('/cleanup', authorize(['ADMIN', 'SUPER_ADMIN']), AccessController.cleanupExpiredAccesses);

module.exports = router; 