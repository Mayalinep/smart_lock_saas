# 📊 Monitoring et Observabilité

## 🎯 Vue d'ensemble

Le système de monitoring de notre SaaS Smart Lock inclut :

- **Logging structuré** avec Winston
- **Health checks** pour la surveillance
- **Métriques Prometheus** pour le monitoring
- **Rate limiting** pour la sécurité
- **Headers de sécurité** pour la protection

## 🔧 Configuration

### Variables d'environnement

```env
# Monitoring
LOG_LEVEL=info                    # Niveau de log (error, warn, info, debug)
NODE_ENV=development             # Environnement (development, production)
ALLOWED_ORIGINS=http://localhost:3000  # Origines CORS autorisées
```

### Structure des logs

```
logs/
├── combined.log    # Tous les logs
└── error.log      # Logs d'erreur uniquement
```

## 📈 Endpoints de monitoring

### Health Check Simple
```bash
GET /api/health
```

**Réponse :**
```json
{
  "success": true,
  "message": "Service opérationnel",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "environment": "development"
}
```

### Health Check Détaillé
```bash
GET /api/health/detailed
```

**Réponse :**
```json
{
  "success": true,
  "message": "Service opérationnel avec détails",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "environment": "development",
  "database": {
    "status": "connected",
    "responseTime": "5ms",
    "statistics": {
      "users": 10,
      "properties": 25,
      "accesses": 150
    }
  },
  "system": {
    "memory": {
      "rss": "45MB",
      "heapUsed": "25MB",
      "heapTotal": "35MB"
    },
    "cpu": {
      "user": "120ms",
      "system": "45ms"
    }
  }
}
```

### Métriques Prometheus
```bash
GET /api/metrics
```

**Format Prometheus :**
```
# HELP nodejs_heap_size_total Process heap size from Node.js in bytes.
# TYPE nodejs_heap_size_total gauge
nodejs_heap_size_total 36700160

# HELP nodejs_heap_size_used Process heap size used from Node.js in bytes.
# TYPE nodejs_heap_size_used gauge
nodejs_heap_size_used 26214400
```

## 🛡️ Sécurité

### Rate Limiting

- **API global** : 100 requêtes/15min par IP
- **Auth** : 5 tentatives/15min par IP
- **Headers de sécurité** automatiques

### Headers de sécurité

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

## 📝 Logging

### Format des logs

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "info",
  "message": "HTTP Request",
  "method": "POST",
  "url": "/api/auth/login",
  "status": 200,
  "duration": "45ms",
  "userAgent": "Mozilla/5.0...",
  "ip": "127.0.0.1",
  "userId": "user123"
}
```

### Niveaux de log

- **error** : Erreurs critiques
- **warn** : Avertissements
- **info** : Informations générales
- **debug** : Détails de débogage

## 🧪 Tests

### Test du monitoring

```bash
node testMonitoring.js
```

Ce script teste :
- ✅ Health checks
- ✅ Métriques Prometheus
- ✅ Rate limiting
- ✅ Headers de sécurité
- ✅ Génération de logs

## 🚀 Production

### Configuration recommandée

```env
NODE_ENV=production
LOG_LEVEL=warn
ALLOWED_ORIGINS=https://tonapp.com
```

### Monitoring externe

- **Prometheus** : Collecte des métriques
- **Grafana** : Visualisation des dashboards
- **ELK Stack** : Centralisation des logs
- **Uptime Robot** : Monitoring externe

## 📊 Métriques importantes

### Performance
- Temps de réponse des requêtes
- Utilisation mémoire/CPU
- Connexions base de données

### Sécurité
- Tentatives de connexion échouées
- Requêtes bloquées par rate limiting
- Erreurs d'authentification

### Business
- Nombre d'utilisateurs actifs
- Propriétés créées
- Accès générés/révoqués

## 🔍 Debugging

### Vérifier les logs

```bash
# Logs combinés
tail -f logs/combined.log

# Logs d'erreur uniquement
tail -f logs/error.log

# Rechercher des erreurs spécifiques
grep "ERROR" logs/combined.log
```

### Health check manuel

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/health/detailed
```

## 🎯 Prochaines étapes

1. **Alerting** : Notifications en cas de problème
2. **Tracing** : Suivi des requêtes distribuées
3. **APM** : Application Performance Monitoring
4. **Dashboard** : Interface de monitoring
5. **Backup** : Rotation automatique des logs 