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
Définir `JWT_SECRET` dans l'étape de test du workflow CI :

```yaml
- name: Run tests
  env:
    NODE_ENV: test
    DATABASE_URL: file:./ci-test.db
    JWT_SECRET: "ci_test_jwt_secret_key_for_testing_only"
    CI: true
  run: npm test -- --runInBand --verbose
```

**Pourquoi ça marche :**
- Les tests d'authentification ont besoin de `JWT_SECRET` pour générer des tokens
- La variable doit être définie dans l'étape "Run tests" spécifiquement
- En production, `JWT_SECRET` doit être défini dans les variables d'environnement

---

## Erreurs de Développement Local

### Erreur : `JWT_SECRET environment variable is required`

**Symptômes :**
- L'application ne démarre pas
- Erreur au démarrage : `JWT_SECRET environment variable is required`

**Solution :**
Ajouter `JWT_SECRET` dans votre fichier `.env` :

```env
JWT_SECRET=your_super_secret_key_here
```

**Note :** Ne jamais commiter le vrai `JWT_SECRET` dans le code. Utiliser des variables d'environnement.

---

## Erreurs de Base de Données

### Erreur : `P1012` - Relation manquante

**Symptômes :**
- Erreur lors de `npx prisma db push`
- Message : "The relation field `owner` is missing an opposite relation field"

**Solution :**
Vérifier que toutes les relations dans `prisma/schema.prisma` ont leurs relations inverses définies.

---

## Erreurs de Tests

### Tests flaky (intermittents)

**Symptômes :**
- Tests qui passent localement mais échouent sur CI
- Échecs aléatoires sur GitHub Actions

**Solution :**
Utiliser `--runInBand` pour exécuter les tests séquentiellement :

```yaml
run: npm test -- --runInBand --verbose
```

---

## Erreurs de Performance

### Erreur : `ECONNRESET` ou timeout

**Symptômes :**
- Connexions Redis qui échouent
- Timeouts sur les requêtes de base de données

**Solution :**
- Vérifier la configuration Redis
- Ajouter des retry mechanisms
- Optimiser les requêtes de base de données

---

## Conseils Généraux

1. **Toujours vérifier les variables d'environnement** avant de déployer
2. **Tester localement** avant de pousser sur GitHub
3. **Utiliser des logs structurés** pour faciliter le debugging
4. **Monitorer les métriques** en production
5. **Garder les secrets séparés** du code source 