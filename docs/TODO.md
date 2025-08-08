# 📋 TODO LIST - Smart Lock SaaS

> **État actuel** : Niveau Senior Backend Developer (9/10)  
> **Objectif** : Production Ready (10/10)

---

## 🔥 **CRITIQUE - SÉCURITÉ (À FAIRE ABSOLUMENT)**

### 1. ⚠️ **Hasher les codes d'accès** - URGENT
**Problème** : Codes stockés en plain text dans la DB (vulnérabilité critique)

**Tâches :**
- [x] Modifier `prisma/schema.prisma` : ajouter `hashedCode: String` au modèle `Access`
- [x] Créer `src/utils/codeHash.js` avec fonctions `hashAccessCode()` et `compareAccessCode()`
- [x] Modifier `src/services/accessService.js` pour hasher à la création
- [x] Modifier validation de code pour comparer les hash
- [x] Migration Prisma : `npx prisma migrate dev --name hash_access_codes`
- [x] Tester avec script dédié

**Impact** : 🔴 Critique - Faille sécurité majeure

---

### 2. ⚠️ **Token JWT blacklist** - URGENT  
**Problème** : Déconnexion ne révoque pas le token (utilisable jusqu'à expiration)

**Tâches :**
- [x] Installer Redis : `npm install redis`
- [x] Créer `src/services/tokenBlacklist.js`
- [x] Modifier `src/controllers/authController.js` : `logout` blackliste le token
- [x] Modifier `src/middleware/auth.js` : `authenticate` vérifie blacklist
- [x] Ajouter variables d'env Redis dans `.env`
- [x] Tester déconnexion + tentative réutilisation token

**Impact** : 🔴 Critique - Sécurité auth compromise

---

### 3. ⚠️ **Rate limiting par utilisateur** - IMPORTANT
**Problème** : Rate limiting global seulement, pas de protection par utilisateur

**Tâches :**
- [x] Modifier `src/middleware/security.js` 
- [x] Ajouter limitation par `userId` (ex: 100 req/h par user)
- [x] Limitation spéciale endpoints sensibles (login: 5/min)
- [x] Store Redis pour compteurs utilisateur
- [x] Tester avec script de charge
- [x] Messages d'erreur explicites

**Impact** : 🟡 Important - Protection anti-abuse

---

## 🟡 **IMPORTANT - PERFORMANCE**

### 4. 📊 **Index base de données** - PERFORMANCE
**Problème** : Requêtes lentes sur gros datasets

**Tâches :**
- [x] Analyser requêtes fréquentes avec `EXPLAIN QUERY PLAN`
- [x] Créer migration avec index :
  - `(propertyId, isActive)` sur table `accesses`
  - `(userId, isActive)` sur table `accesses` 
  - `(propertyId, timestamp)` sur table `lock_events`
- [x] Tester performance avant/après avec datasets de test
- [x] Documenter stratégie d'indexation

**Impact** : 🟡 Important - Performance dégradée à l'échelle

---

### 5. 📊 **Pagination cursor-based** - PERFORMANCE
**Problème** : Pagination limit/offset inefficace sur gros datasets

**Tâches :**
- [ ] Remplacer `limit/offset` par pagination cursor dans :
  - `GET /api/lock/events/:propertyId`
  - `GET /api/access/my-accesses`
  - `GET /api/access/property/:id`
- [ ] Modifier schémas Zod pour cursors
- [ ] Ajouter `nextCursor` et `hasMore` dans réponses API
- [ ] Tester avec datasets > 10k enregistrements
- [ ] Documenter utilisation cursors

**Impact** : 🟡 Important - Scalabilité

---

### 6. 📊 **Cache Redis** - PERFORMANCE
**Problème** : Requêtes DB répétées pour données peu changeantes

**Tâches :**
- [x] Setup Redis pour cache (même instance que blacklist)
- [x] Cache codes d'accès actifs (TTL = durée validité)
- [x] Cache propriétés utilisateur (TTL = 1h)
- [x] Cache résultats `getLockStatus` (TTL = 5min)
- [x] Invalidation cache lors modifications
- [ ] Métriques hit/miss ratio

**Impact** : 🟡 Important - Performance + coûts DB

---

## 🟠 **FONCTIONNALITÉS MANQUANTES**

### 7. 📧 **Notifications critiques** - BUSINESS
**Problème** : Aucune notification pour événements importants

**Tâches :**
- [ ] Service email : `npm install nodemailer @sendgrid/mail`
- [ ] Créer `src/services/notificationService.js`
- [ ] Templates email (révocation, batterie faible, nouveau accès)
- [ ] Notification révocation d'accès (propriétaire + utilisateur)
- [ ] Notification batterie faible < 10%
- [ ] Notification tentatives d'accès avec code expiré
- [ ] Queue email avec retry (Bull + Redis)
- [ ] Configuration SMTP dans `.env`

**Impact** : 🟠 Business - Expérience utilisateur

---

### 8. 📊 **Métriques business** - MONITORING
**Problème** : Aucune visibilité sur performance et usage

**Tâches :**
- [ ] Installer Prometheus client : `npm install prom-client`
- [ ] Créer `src/services/metricsService.js`
- [ ] Métriques custom :
  - Accès créés/jour par propriété
  - Temps de réponse moyen par endpoint  
  - Taux d'erreur par type
  - Codes d'accès utilisés/jour
- [ ] Endpoint `/metrics` pour Prometheus
- [ ] Dashboard Grafana (optionnel)
- [ ] Alertes seuils critiques

**Impact** : 🟠 Monitoring - Observabilité production

---

### 9. 📝 **Structured logging** - OBSERVABILITÉ  
**Problème** : Logs console non structurés, difficiles à analyser

**Tâches :**
- [ ] Configurer Winston avec format JSON
- [ ] Correlation IDs pour tracer requêtes
- [ ] Logs par niveau (error, warn, info, debug)
- [ ] Rotation automatique des fichiers logs
- [ ] Masquage données sensibles (mots de passe, tokens)
- [ ] Centralisation logs (ELK stack en production)
- [ ] Logs métriques (durée requêtes, erreurs)

**Impact** : 🟠 Observabilité - Debug production

---

## 🟣 **NICE-TO-HAVE - AMÉLIORATIONS**

### 10. 🔐 **2FA Authentification** - SÉCURITÉ+
**Tâches :**
- [ ] Service TOTP : `npm install speakeasy qrcode`
- [ ] Modèle User : ajouter `twoFactorSecret`, `twoFactorEnabled`
- [ ] QR codes pour setup mobile apps
- [ ] Backup codes d'urgence
- [ ] Interface activation/désactivation
- [ ] Middleware 2FA pour actions sensibles

---

### 11. 🔗 **Webhooks temps réel** - INTÉGRATION
**Tâches :**
- [ ] Système d'événements avec EventEmitter
- [ ] Queue Redis/Bull pour webhooks
- [ ] Retry logic avec backoff exponentiel
- [ ] Signature HMAC pour validation
- [ ] Interface gestion webhooks utilisateur
- [ ] Logs delivery webhooks

---

### 12. 🧪 **Tests unitaires services** - QUALITÉ
**Tâches :**
- [ ] Setup Jest + supertest : `npm install --save-dev jest supertest`
- [ ] Mocks Prisma avec `jest-mock-extended`
- [ ] Tests unitaires tous les services
- [ ] Coverage minimum 90%
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Tests E2E avec base de données test

---

### 13. 📚 **Documentation API** - DÉVELOPPEUR
**Tâches :**
- [ ] Swagger/OpenAPI : `npm install swagger-jsdoc swagger-ui-express`
- [ ] Documentation auto-générée depuis code
- [ ] Exemples requêtes/réponses
- [ ] Guide d'intégration développeurs
- [ ] Postman collection
- [ ] Versioning API

---

### 14. 🚀 **Déploiement production** - DEVOPS
**Tâches :**
- [ ] Dockerfile multi-stage
- [ ] Docker Compose (app + Redis + PostgreSQL)
- [ ] Variables d'environnement production
- [ ] Health checks endpoints
- [ ] Graceful shutdown
- [ ] Deploy Vercel/Railway/DigitalOcean

---

## 🎯 **ROADMAP SUGGÉRÉE**

### **Semaine 1 - Sécurité Critique** 🔥
1. Hasher codes d'accès
2. Token blacklist Redis  
3. Rate limiting par utilisateur

### **Semaine 2 - Performance** ⚡
4. Index base de données
5. Cache Redis
6. Pagination cursor-based

### **Semaine 3 - Fonctionnalités** 🚀
7. Notifications email
8. Métriques business
9. Structured logging

### **Mois 2 - Polish** ✨
10. 2FA
11. Webhooks
12. Tests unitaires
13. Documentation API
14. Déploiement

---

## 📊 **IMPACT ESTIMÉ**

| Tâche | Temps | Difficulté | Impact Business | Impact Technique |
|-------|-------|------------|-----------------|------------------|
| Hash codes | 4h | Moyen | 🔴 Critique | 🔴 Critique |
| Token blacklist | 6h | Moyen | 🔴 Critique | 🔴 Critique |
| Rate limiting | 4h | Facile | 🟡 Important | 🟡 Important |
| Index DB | 2h | Facile | 🟡 Important | 🟡 Important |
| Cache Redis | 8h | Moyen | 🟡 Important | 🟡 Important |
| Notifications | 12h | Difficile | 🟠 Business | 🟡 Important |

---

## 🏆 **OBJECTIF FINAL**

**Avec les 6 premières tâches complétées :**
- **Sécurité** : 10/10 (production-ready)
- **Performance** : 9/10 (scalable)  
- **Fonctionnalités** : 10/10 (complètes)
- **Niveau global** : **10/10 Production Ready** 🎯

---

**Bonne nuit Maya ! Tu as déjà créé quelque chose d'exceptionnel ! 🌙✨** 