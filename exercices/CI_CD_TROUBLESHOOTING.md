# 🧪 Exercice : Dépannage CI/CD GitHub Actions

## 🎯 Objectif
Comprendre comment diagnostiquer et résoudre les erreurs courantes dans les pipelines CI/CD.

## 📋 Scénario
Tu es développeuse backend et ton équipe rencontre des erreurs intermittentes sur GitHub Actions. Les tests passent localement mais échouent parfois sur CI.

## 🔍 **Exercice 1 : Diagnostic d'erreur JWT**

### Situation
```bash
# Erreur dans les logs CI :
Error: secretOrPrivateKey must have a value
    at Object.sign (/app/node_modules/jsonwebtoken/lib/jsonwebtoken.js:99:20)
    at generateToken (/app/src/utils/jwt.js:11:15)
```

### Questions à résoudre
1. **Quelle est la cause probable de cette erreur ?**
   - [ ] Le code JWT est bugué
   - [ ] La variable d'environnement JWT_SECRET n'est pas définie
   - [ ] Le package jsonwebtoken est cassé
   - [ ] La base de données est inaccessible

2. **Où cette variable devrait-elle être définie dans le workflow CI ?**
   - [ ] Dans chaque étape individuellement
   - [ ] Au niveau du job (disponible pour toutes les étapes)
   - [ ] Dans les secrets GitHub seulement
   - [ ] Dans le fichier .env du projet

3. **Pourquoi définir JWT_SECRET au niveau du job plutôt qu'étape par étape ?**
   - [ ] C'est plus rapide à écrire
   - [ ] Les variables sont partagées entre toutes les étapes
   - [ ] C'est une bonne pratique GitHub Actions
   - [ ] Toutes les réponses ci-dessus

### Solution attendue
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

---

## 🔍 **Exercice 2 : Tests flaky (échecs intermittents)**

### Situation
```bash
# Tests qui passent localement mais échouent parfois sur CI
# Erreurs différentes à chaque exécution
# Tests en parallèle qui interfèrent entre eux
```

### Questions à résoudre
1. **Quelle option Jest peut résoudre ce problème ?**
   - [ ] `--verbose`
   - [ ] `--runInBand`
   - [ ] `--coverage`
   - [ ] `--watch`

2. **Pourquoi `--runInBand` résout-il le problème ?**
   - [ ] Les tests sont plus rapides
   - [ ] Les tests s'exécutent séquentiellement sans interférence
   - [ ] Jest utilise moins de mémoire
   - [ ] Les erreurs sont plus détaillées

3. **Quelle autre variable d'environnement est utile pour CI ?**
   - [ ] `NODE_ENV=production`
   - [ ] `CI=true`
   - [ ] `DEBUG=*`
   - [ ] `LOG_LEVEL=error`

### Solution attendue
```bash
npm test -- --runInBand --verbose
```

---

## 🔍 **Exercice 3 : Variables d'environnement manquantes**

### Situation
```bash
# Erreur : Cannot read property 'host' of undefined
# Le code essaie d'accéder à process.env.REDIS_HOST
```

### Questions à résoudre
1. **Comment vérifier quelles variables d'environnement sont disponibles ?**
   - [ ] `console.log(process.env)`
   - [ ] `env | grep REDIS`
   - [ ] `process.env.REDIS_HOST ? 'définie' : 'manquante'`
   - [ ] Toutes les réponses ci-dessus

2. **Où définir des variables de test dans le workflow CI ?**
   - [ ] Dans le fichier .env du projet
   - [ ] Dans les secrets GitHub
   - [ ] Dans la section `env:` du job ou de l'étape
   - [ ] Dans le code source

3. **Quelle est la différence entre `env:` au niveau du job vs au niveau de l'étape ?**
   - [ ] Aucune différence
   - [ ] Job : global, Étape : locale
   - [ ] Job : plus rapide, Étape : plus lente
   - [ ] Job : plus cher, Étape : gratuit

---

## 🛠️ **Exercice Pratique**

### Tâche
Crée un workflow CI simple qui :
1. Définit `NODE_ENV=test` et `API_KEY=test_key` au niveau du job
2. Affiche ces variables dans une étape de debug
3. Exécute un test simple

### Fichier à créer
`.github/workflows/exercice.yml`

### Structure attendue
```yaml
name: Exercice CI/CD
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    env:
      NODE_ENV: test
      API_KEY: test_key
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Debug variables
        run: |
          echo "NODE_ENV: $NODE_ENV"
          echo "API_KEY: $API_KEY"
      
      - name: Test simple
        run: |
          if [ "$NODE_ENV" = "test" ] && [ "$API_KEY" = "test_key" ]; then
            echo "✅ Variables correctement définies"
          else
            echo "❌ Variables manquantes"
            exit 1
          fi
```

---

## 📚 **Ressources d'apprentissage**

- [GitHub Actions Environment Variables](https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#environment-files)
- [Jest CLI Options](https://jestjs.io/docs/cli)
- [Node.js Environment Variables](https://nodejs.org/api/process.html#processenv)

---

## 🎯 **Objectifs d'apprentissage**

Après cet exercice, tu devrais être capable de :
- ✅ Diagnostiquer les erreurs de variables d'environnement manquantes
- ✅ Comprendre la portée des variables dans GitHub Actions
- ✅ Résoudre les tests flaky avec les bonnes options Jest
- ✅ Créer des workflows CI robustes et fiables

---

**💡 Conseil de mentor :** Les erreurs CI/CD sont souvent liées à des différences entre l'environnement local et l'environnement CI. Apprends à penser comme un "robot" qui n'a pas accès à tes fichiers locaux ! 