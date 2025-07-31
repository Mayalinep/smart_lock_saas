# Architecture du SaaS Smart Lock

Ce document explique l'architecture du backend Node.js pour le SaaS de gestion d'accès digital aux logements.

## 🏗️ Structure du projet

```
smart_lock_saas/
├── package.json              # Dépendances et scripts npm
├── env.example               # Variables d'environnement d'exemple
├── .gitignore               # Fichiers à exclure de Git
├── index.js                 # Point d'entrée du serveur Express
├── prisma/
│   └── schema.prisma        # Schéma de base de données Prisma
├── src/
│   ├── config/
│   │   └── database.js      # Configuration Prisma Client
│   ├── controllers/         # Logique de contrôle des routes
│   │   ├── authController.js
│   │   ├── propertyController.js
│   │   └── accessController.js
│   ├── middleware/          # Middlewares Express
│   │   ├── auth.js         # Authentification JWT
│   │   └── errorHandler.js # Gestion globale des erreurs
│   ├── routes/             # Définition des routes Express
│   │   ├── auth.js
│   │   ├── properties.js
│   │   └── access.js
│   ├── services/           # Logique métier
│   │   ├── authService.js
│   │   ├── propertyService.js
│   │   └── accessService.js
│   └── utils/              # Utilitaires réutilisables
│       ├── jwt.js         # Gestion des tokens JWT
│       └── password.js    # Hashage des mots de passe
└── docs/
    └── ARCHITECTURE.md    # Cette documentation
```

## 🎯 Architecture en couches

### 1. Couche de Routage (routes/)
- **Responsabilité** : Définir les endpoints API et appliquer les middlewares
- **Principe** : Chaque domaine métier a son propre fichier de routes
- **Exemple** : `POST /api/auth/login` → `authController.login`

### 2. Couche de Contrôle (controllers/)
- **Responsabilité** : Gérer les requêtes HTTP, valider les entrées, appeler les services
- **Principe** : Logique de présentation uniquement, pas de logique métier
- **Format de réponse standardisé** :
```json
{
  "success": true/false,
  "message": "Description",
  "data": { ... }, // Optionnel
  "errors": [...] // En cas d'erreur de validation
}
```

### 3. Couche de Service (services/)
- **Responsabilité** : Logique métier, règles de validation, interactions avec la base
- **Principe** : Classes statiques avec méthodes métier réutilisables
- **Avantage** : Testable indépendamment des contrôleurs

### 4. Couche de Données (prisma/)
- **Responsabilité** : Modélisation et accès aux données
- **ORM** : Prisma avec PostgreSQL
- **Avantage** : Type-safety, migrations automatiques, client généré

## 📊 Modèle de données

### User (Utilisateur)
```prisma
- id: String (CUID)
- email: String (unique)
- password: String (hashé avec bcrypt)
- firstName, lastName: String
- phone: String? (optionnel)
- role: UserRole (USER, ADMIN, SUPER_ADMIN)
- isActive: Boolean
- timestamps: createdAt, updatedAt
```

### Property (Propriété/Logement)
```prisma
- id: String (CUID)
- name: String (nom du logement)
- address: String (adresse complète)
- description: String? (optionnel)
- isActive: Boolean
- ownerId: String (référence vers User)
- timestamps: createdAt, updatedAt
```

### Access (Accès)
```prisma
- id: String (CUID)
- code: String (unique, code d'accès généré)
- startDate, endDate: DateTime (période de validité)
- isActive: Boolean
- accessType: AccessType (PERMANENT, TEMPORARY, ONE_TIME)
- description: String? (optionnel)
- userId: String (utilisateur qui a l'accès)
- propertyId: String (propriété accessible)
- timestamps: createdAt, updatedAt
```

## 🔐 Authentification et Sécurité

### JWT avec Cookies HTTP-Only
- **Token stocké** : Dans un cookie `httpOnly` pour éviter les attaques XSS
- **Expiration** : 7 jours par défaut (configurable)
- **Refresh** : À implémenter selon les besoins

### Sécurité des mots de passe
- **Algorithme** : bcrypt avec 12 rounds de salt
- **Validation** : Longueur min, majuscules, minuscules, chiffres, caractères spéciaux

### Middleware d'authentification
- **authenticate** : Vérifie le token JWT, charge l'utilisateur
- **authorize** : Vérifie les rôles utilisateur
- **optionalAuth** : Authentification optionnelle (ne bloque pas si pas de token)

## 🛠️ Middlewares de sécurité

### Protection générale
- **helmet** : Headers de sécurité HTTP
- **cors** : Configuration CORS pour le frontend
- **rate-limiting** : Limitation du nombre de requêtes

### Gestion d'erreurs
- **errorHandler** : Middleware global de gestion d'erreurs
- **Logging** : Console en développement, à améliorer en production

## 📋 Routes API

### Authentification (`/api/auth`)
```
POST /register      # Inscription
POST /login         # Connexion
POST /logout        # Déconnexion
GET  /me           # Profil utilisateur (auth requis)
PUT  /profile      # Mise à jour profil (auth requis)
PUT  /password     # Changement mot de passe (auth requis)
```

### Propriétés (`/api/properties`)
```
POST /              # Créer une propriété (auth requis)
GET  /              # Mes propriétés (auth requis)
GET  /:id           # Détails d'une propriété (auth requis)
PUT  /:id           # Modifier une propriété (auth requis)
DELETE /:id         # Supprimer une propriété (auth requis)
PATCH /:id/status   # Activer/désactiver (auth requis)
```

### Accès (`/api/access`)
```
POST /validate              # Valider un code d'accès (public)
POST /                      # Créer un accès (auth requis)
GET  /my-accesses          # Mes accès (auth requis)
GET  /property/:propertyId # Accès d'une propriété (auth requis)
GET  /:id                  # Détails d'un accès (auth requis)
PUT  /:id                  # Modifier un accès (auth requis)
DELETE /:id                # Révoquer un accès (auth requis)
POST /cleanup              # Nettoyer les accès expirés (admin)
```

## 🚀 Points d'amélioration futurs

### Fonctionnalités avancées
- **Notifications** : Email/SMS pour les nouveaux accès
- **Audit logs** : Traçabilité des actions utilisateur
- **Analytics** : Statistiques d'utilisation des accès
- **Webhooks** : Notifications temps réel vers les serrures

### Sécurité renforcée
- **2FA** : Authentification à deux facteurs
- **Rate limiting avancé** : Par utilisateur, par IP
- **Token blacklisting** : Pour la déconnexion immédiate
- **Chiffrement des codes** : Codes d'accès chiffrés en base

### Performance
- **Cache Redis** : Pour les codes d'accès fréquents
- **Pagination** : Sur les listes de propriétés/accès
- **Optimisation des requêtes** : Index de base de données

## 🧪 Prochaines étapes de développement

1. **Implémenter l'authentification** (`authService.js`, `authController.js`)
2. **Implémenter la gestion des propriétés** (`propertyService.js`)
3. **Implémenter la gestion des accès** (`accessService.js`)
4. **Tests unitaires** pour chaque service
5. **Tests d'intégration** pour les API
6. **Documentation API** avec Swagger/OpenAPI

Cette architecture respecte les principes SOLID et permet une montée en charge progressive du projet. 