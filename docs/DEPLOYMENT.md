# 🚀 Déploiement (débutant friendly)

Ce guide te permet de déployer rapidement sans Docker. On utilisera un PaaS (Railway/Render) et des services managés (PostgreSQL + Redis).

## 1) Pré-requis
- Compte sur un PaaS: Railway (facile) ou Render/Heroku
- Repo Git distant (GitHub/GitLab)

## 2) Choix de l’infra (recommandé)
- Base de données: PostgreSQL managé
- Cache/blacklist/rate-limit: Redis managé
- Application: Node.js (build & start simples)

## 3) Variables d’environnement (obligatoires)
- `NODE_ENV=production`
- `PORT=3000` (ou laissé par le PaaS)
- `DATABASE_URL` (PostgreSQL, format: `postgresql://user:pass@host:port/db?schema=public`)
- `REDIS_URL` (Redis, format: `redis://default:pass@host:port`)
- `JWT_SECRET` (longue chaîne aléatoire)
- `COOKIE_SECRET` (longue chaîne aléatoire)

Astuce: copie `env.example` si dispo et remplis sur le PaaS.

## 4) Commandes (build & start)
- Build:
  - `npm install`
  - `npx prisma generate`
- Démarrage (prod):
  - `npx prisma migrate deploy` (applique les migrations en prod)
  - `node index.js`

Sur Railway/Render, configure:
- Build Command: `npm install && npx prisma generate`
- Start Command: `npx prisma migrate deploy && node index.js`

## 5) Provision des services
- PostgreSQL: crée une instance → récupère l’URL → colle dans `DATABASE_URL`
- Redis: crée une instance → récupère l’URL → colle dans `REDIS_URL`

## 6) Déploiement
- Connecte le repo au PaaS
- Configure les variables d’env
- Déploie (Railway: bouton Deploy / Render: Auto Deploy sur push)

## 7) Vérifications post-déploiement
- `GET /api/health` doit répondre 200
- `GET /api/metrics` (Prometheus) accessible pour supervision
- Flows critiques:
  - inscription/login/logout (blacklist JWT)
  - création propriété / accès
  - validation code `/api/access/validate`
  - statut serrure `/api/lock/status/:propertyId`
  - accès listés + pagination cursor (`nextCursor`/`hasMore`)

## 8) Observabilité & logs
- Logs JSON + `X-Request-Id` (corrélation) déjà activés
- Rotation fichiers côté app; en PaaS, utilise les logs managés (export vers ELK/Datadog possible)

## 9) Sécurité (rappels prod)
- Utilise des secrets forts pour `JWT_SECRET`/`COOKIE_SECRET`
- Forcer HTTPS via PaaS
- Ne pas exposer la DB publique
- Limites & timeouts HTTP (PaaS)
- Sauvegardes DB (activer snapshots managés)

## 10) Roadmap “plus tard”
- Docker/Compose (app + Redis + Postgres) pour portabilité
- CI/CD (tests + migrations auto)
- Alerting (uptime, erreurs 5xx, latences p95/p99)

---
Besoin d’aide pas à pas sur Railway ou Render ? On peut le faire ensemble en 10 minutes.
