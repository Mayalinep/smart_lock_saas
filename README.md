# 🔐 Smart Lock SaaS - Backend

Backend Node.js pour un SaaS de gestion d'accès digital aux logements utilisant Express, Prisma et PostgreSQL.

## 🚀 Démarrage rapide

### Prérequis
- Node.js 18+ 
- PostgreSQL 14+
- npm ou yarn

### Installation

1. **Cloner et installer les dépendances**
```bash
npm install
```

2. **Configurer l'environnement**
```bash
cp env.example .env
# Éditer .env avec vos propres valeurs
```

3. **Configurer la base de données**
```bash
# Générer le client Prisma
npm run db:generate

# Pousser le schéma vers la base
npm run db:push

# Ou créer une migration
npm run db:migrate
```

4. **Lancer le serveur**
```bash
# Développement avec hot-reload
npm run dev

# Production
npm start
```

Le serveur sera accessible sur `http://localhost:3000`

## 🛠️ Scripts disponibles

```bash
npm start              # Démarrer le serveur en production
npm run dev            # Démarrer en mode développement
npm run db:generate    # Générer le client Prisma
npm run db:push        # Pousser le schéma sans migration
npm run db:migrate     # Créer et appliquer une migration
npm run db:studio      # Interface graphique Prisma
```

## 📁 Structure du projet

```
├── index.js           # Point d'entrée du serveur
├── env.example        # Variables d'environnement exemple
├── prisma/
│   └── schema.prisma  # Schéma de base de données
└── src/
    ├── config/        # Configuration (database)
    ├── controllers/   # Contrôleurs Express
    ├── middleware/    # Middlewares (auth, errors)
    ├── routes/        # Définition des routes
    ├── services/      # Logique métier
    └── utils/         # Utilitaires (jwt, password)
```

## 🔧 Configuration (.env)

```bash
# Base de données
DATABASE_URL="postgresql://user:password@localhost:5432/smart_lock_saas"

# JWT
JWT_SECRET="votre_clé_secrète_très_sécurisée"
JWT_EXPIRES_IN="7d"

# Serveur
PORT=3000
NODE_ENV="development"
```

## 📊 API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion  
- `POST /api/auth/logout` - Déconnexion
- `GET /api/auth/me` - Profil utilisateur
- `PUT /api/auth/profile` - Mise à jour profil
- `PUT /api/auth/password` - Changement mot de passe

### Propriétés
- `POST /api/properties` - Créer une propriété
- `GET /api/properties` - Lister mes propriétés
- `GET /api/properties/:id` - Détails d'une propriété
- `PUT /api/properties/:id` - Modifier une propriété
- `DELETE /api/properties/:id` - Supprimer une propriété

### Accès
- `POST /api/access/validate` - Valider un code (public)
- `POST /api/access` - Créer un accès
- `GET /api/access/my-accesses` - Mes accès
- `GET /api/access/property/:id` - Accès d'une propriété
- `PUT /api/access/:id` - Modifier un accès
- `DELETE /api/access/:id` - Révoquer un accès

## 🎯 État du développement

### ✅ Complété
- [x] Structure du projet
- [x] Configuration Prisma + PostgreSQL
- [x] Modèles de données (User, Property, Access)
- [x] Squelette des routes et controllers
- [x] Middlewares de sécurité
- [x] Utilitaires JWT et hashage de mots de passe

### 🚧 À implémenter
- [ ] Logique métier dans les services
- [ ] Implémentation des controllers
- [ ] Middleware d'authentification
- [ ] Validation des données
- [ ] Tests unitaires
- [ ] Documentation API

## 🏗️ Architecture

Le projet suit une architecture en couches :

1. **Routes** → Définition des endpoints
2. **Controllers** → Gestion des requêtes HTTP  
3. **Services** → Logique métier
4. **Prisma** → Accès aux données

Voir [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) pour plus de détails.

## 🔐 Sécurité

- JWT avec cookies HTTP-only
- Hashage bcrypt (12 rounds)
- Validation des mots de passe
- Rate limiting
- Headers de sécurité (Helmet)
- CORS configuré

## 🤝 Développement

Ce projet est conçu comme un template d'apprentissage. Chaque fichier contient des commentaires `TODO` détaillant ce qui doit être implémenté.

### Ordre d'implémentation recommandé :
1. Middleware d'authentification (`src/middleware/auth.js`)
2. Service d'authentification (`src/services/authService.js`)
3. Controller d'authentification (`src/controllers/authController.js`)
4. Services métier (Property → Access)
5. Tests et validation

---

📚 **Documentation complète** : Voir `docs/ARCHITECTURE.md` 