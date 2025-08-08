# Guide de Dépannage - Smart Lock SaaS

Ce document répertorie les erreurs courantes rencontrées lors du développement et du déploiement, ainsi que leurs solutions.

## Erreurs CI/CD GitHub Actions

### Erreur : `secretOrPrivateKey must have a value`

**Symptômes :**
- Les tests échouent avec l'erreur JWT
- Erreur dans les logs CI : `Error: secretOrPrivateKey must have a value`

**Cause :**
La variable d'environnement `JWT_SECRET` n'est pas définie dans l'environnement CI, empêchant la génération et vérification des tokens JWT.

**Solution :**
Définir `JWT_SECRET` au niveau du job dans `.github/workflows/ci.yml` :

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    env:
      JWT_SECRET: "ci_test_jwt_secret_key_for_testing_only"
      NODE_ENV: test
    steps:
      # ... étapes du workflow
```

**Pourquoi cette solution :**
- Les variables d'environnement définies dans `env:` au niveau du job sont disponibles dans toutes les étapes
- Les variables définies uniquement dans une étape spécifique ne sont pas accessibles aux autres étapes
- Prisma et les tests ont besoin d'accéder à `JWT_SECRET` dès le démarrage

### Erreur : Tests flaky (échecs intermittents)

**Symptômes :**
- Tests qui passent localement mais échouent parfois sur CI
- Erreurs différentes à chaque exécution

**Solution :**
Utiliser `--runInBand` pour exécuter les tests séquentiellement :

```yaml
- name: Run tests
  run: npm test -- --runInBand --verbose
```

**Pourquoi :**
- Les tests en parallèle peuvent interférer entre eux
- L'isolation des ressources est meilleure en mode séquentiel
- Plus stable dans l'environnement CI

## Erreurs de Base de Données

### Erreur Prisma : Relation manquante

**Symptômes :**
```
P1012: The relation field `owner` on model `WebhookEndpoint` is missing an opposite relation field on the model `User`.
```

**Solution :**
Ajouter la relation inverse dans le schéma Prisma :

```prisma
model User {
  // ... autres champs
  webhookEndpoints WebhookEndpoint[]
}

model WebhookEndpoint {
  // ... autres champs
  owner User @relation(fields: [ownerId], references: [id])
  ownerId String
}
```

## Erreurs de Validation

### Erreur Zod : Validation échouée

**Symptômes :**
- Erreur 400 "Bad Request" avec "Erreur de validation"
- Tests qui échouent sur la validation des données

**Solutions :**
1. Vérifier que les données de test respectent les schémas Zod
2. S'assurer que les IDs de propriété sont valides dans les tests
3. Utiliser des données de test cohérentes

## Erreurs Redis/BullMQ

### Erreur : `maxRetriesPerRequest must be null`

**Symptômes :**
```
BullMQ: Your redis options maxRetriesPerRequest must be null.
```

**Solution :**
Configurer Redis pour BullMQ avec la bonne option :

```javascript
const redisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null // Requis pour BullMQ
};
```

## Erreurs de Déploiement

### Erreur Docker : Port déjà utilisé

**Symptômes :**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution :**
1. Arrêter les conteneurs existants : `docker-compose down`
2. Vérifier qu'aucun processus n'utilise le port : `lsof -i :3000`
3. Relancer : `docker-compose up -d`

## Prévention des Erreurs

### Bonnes Pratiques

1. **Variables d'environnement :**
   - Toujours définir les variables critiques au niveau du job CI
   - Utiliser des valeurs de test appropriées pour CI
   - Documenter toutes les variables requises

2. **Tests :**
   - Exécuter en mode séquentiel sur CI
   - Utiliser des bases de données de test isolées
   - Nettoyer les données entre les tests

3. **Validation :**
   - Tester avec des données valides et invalides
   - Vérifier la cohérence des relations de base de données
   - Utiliser des schémas Zod stricts

4. **Monitoring :**
   - Surveiller les logs CI pour détecter les patterns d'erreur
   - Utiliser les métriques Prometheus pour identifier les goulots d'étranglement
   - Configurer des alertes pour les échecs critiques

## Ressources Utiles

- [Documentation GitHub Actions](https://docs.github.com/en/actions)
- [Documentation Prisma](https://www.prisma.io/docs/)
- [Documentation BullMQ](https://docs.bullmq.io/)
- [Documentation Zod](https://zod.dev/) 