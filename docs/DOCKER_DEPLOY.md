## Déployer avec Docker et Docker Compose

### Prérequis
- Docker Desktop installé
- Docker Compose (intégré à Docker Desktop)

### Services inclus
- app (Node.js/Express, Prisma)
- worker (BullMQ pour emails)
- postgres (base de données)
- redis (cache, rate limit, blacklist, queues)

### Configuration
Copie `.env` à partir de `env.example` et ajuste si besoin.

Variables importantes:
- `DATABASE_URL=postgresql://postgres:postgres@postgres:5432/smart_lock?schema=public`
- `REDIS_URL=redis://redis:6379`
- `JWT_SECRET=changeme`
- SMTP si tu veux envoyer des emails

### Construire et lancer
```
docker compose up --build -d
```

Vérifier l’état:
```
docker compose ps
docker compose logs -f app
```

### Endpoints de santé
- Liveness: `GET /api/health/liveness`
- Readiness: `GET /api/health/readiness`
- Health simple: `GET /api/health`
- Health détaillé: `GET /api/health/detailed`

### Migrations Prisma
Le conteneur `app` exécute `prisma migrate deploy` au démarrage.

Par défaut, le projet est configuré pour SQLite en dev (`prisma/schema.prisma`). En Docker (Postgres), Prisma détecte `DATABASE_URL` Postgres et fonctionne, mais si tu souhaites générer le client explicitement pour Postgres, tu peux utiliser `prisma/schema.postgres.prisma` avant build:

```
cp prisma/schema.postgres.prisma prisma/schema.prisma
```
Puis reconstruire l’image.

### Arrêt gracieux
`SIGTERM/SIGINT` ferme le serveur HTTP, les queues BullMQ et Redis.

### Accès API/Docs
- API: `http://localhost:3000/api/...`
- Swagger UI: `http://localhost:3000/api/docs/`

### Optionnel: Observabilité locale (Prometheus + Grafana)

Ajoute des services dans `docker-compose.yml` si tu souhaites tester:

```yaml
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - ./monitoring/alerts.yml:/etc/prometheus/alerts.yml:ro
    ports:
      - "9090:9090"
    depends_on:
      - app
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    depends_on:
      - prometheus
```

Configure la source Prometheus dans Grafana: `http://prometheus:9090`.

### Dépannage
- Postgres ne démarre pas: supprime le volume `pgdata` si besoin
```
docker compose down -v
```
- Email en test: sans SMTP, un DRY-RUN logge le mail dans la console

### Production
- Remplacer secrets (JWT, SMTP, DB)
- Activer stockage persistant sécurisé
- Configurer reverse proxy (ex: Traefik, Nginx) et TLS

