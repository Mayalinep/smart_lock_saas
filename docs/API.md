# 📚 Guide API (pas-à-pas)

## Base
- URL locale: `http://localhost:3000/api`
- Docs Swagger: `http://localhost:3000/api/docs`
- Metrics Prometheus: `http://localhost:3000/api/metrics`

## Parcours complet (via Swagger)
1) Auth → POST `/auth/register` (email unique, mot de passe fort)
2) Auth → POST `/auth/login` (le cookie `token` httpOnly est stocké par le navigateur)
3) Propriété → POST `/properties` (title/address)
4) Guest → POST `/auth/register` (nouvel utilisateur invité)
5) Accès → POST `/access` (propertyId = propriété du propriétaire; userId = id du guest)
6) Vérifier → POST `/access/validate`
7) Lister → GET `/access/property/{propertyId}?limit=20`
8) Statut serrure → GET `/lock/status/{propertyId}`

Conseils
- Si 401: reconnecte-toi sur `/auth/login`.
- Si 403: vérifie que `propertyId` t'appartient et que `userId` ≠ propriétaire.

## Parcours rapide (terminal)
```bash
EMAIL="user.$(date +%s)@example.com"
# Register (owner)
curl -s -X POST http://localhost:3000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"'$EMAIL'","password":"TestPassword123!","firstName":"Maya","lastName":"Dev"}'
# Login (owner) → extraire token
TOKEN=$(curl -s -D - http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"'$EMAIL'","password":"TestPassword123!"}' | sed -n 's/Set-Cookie: token=\([^;]*\).*/\1/p' | head -n1)
# Propriété
PROP_ID=$(curl -s -X POST http://localhost:3000/api/properties \
  -H 'Content-Type: application/json' --cookie "token=$TOKEN" \
  -d '{"title":"Appartement A","address":"10 rue X","description":""}' | jq -r '.data.property.id')
# Guest
GUEST_EMAIL="guest.$(date +%s)@example.com"
GUEST_ID=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"'$GUEST_EMAIL'","password":"TestPassword123!","firstName":"Guest","lastName":"User"}' | jq -r '.data.user.id')
# Accès
curl -i -X POST http://localhost:3000/api/access \
  -H 'Content-Type: application/json' --cookie "token=$TOKEN" \
  -d '{"propertyId":"'$PROP_ID'","userId":"'$GUEST_ID'","startDate":"2025-08-08T10:55:00.000Z","endDate":"2025-08-15T10:55:00.000Z","accessType":"TEMPORARY","description":"Invité"}'
```

## Postman collection
- Fichier: `docs/Postman_SmartLock.postman_collection.json`
- Variables: `baseUrl` (défaut `http://localhost:3000`), `token` (rempli automatiquement après login)
- Après POST `/auth/login`, le script de test extrait `Set-Cookie: token=...` dans la variable `token`.
- Les requêtes protégées envoient l'en-tête `Cookie: token={{token}}`.

## Codes d'erreurs fréquents
- 400: validation Zod (format email, mot de passe, dates)
- 401: non authentifié (refaire login)
- 403: non autorisé (mauvais propriétaire)

Bonne exploration !

## Guide intégration front (fetch/axios)

### 1) Se connecter (login) et stocker le cookie
Le backend dépose un cookie httpOnly `token`. En navigateur, il est géré automatiquement si `credentials: 'include'` est utilisé.

```javascript
// fetch
await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // IMPORTANT pour envoyer/recevoir le cookie
  body: JSON.stringify({ email, password })
});

// axios
import axios from 'axios';
const api = axios.create({ baseURL: 'http://localhost:3000/api', withCredentials: true });
await api.post('/auth/login', { email, password });
```

### 2) Appeler des endpoints protégés
```javascript
// fetch
const res = await fetch('http://localhost:3000/api/properties', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ name: 'Appartement Canal', address: '12 Rue des Fleurs' })
});

// axios
const { data } = await api.post('/properties', { name: 'Appartement Canal', address: '12 Rue des Fleurs' });
```

### 3) Gérer les erreurs 401 vs 403
```javascript
try {
  await api.get(`/lock/status/${propertyId}`);
} catch (err) {
  if (err.response?.status === 401) {
    // non authentifié → rediriger vers page de login
  } else if (err.response?.status === 403) {
    // authentifié mais interdit → afficher un message d'accès refusé
  } else {
    // autre erreur
  }
}
```

### 4) Pagination cursor-based côté front
```javascript
let cursor = null;
do {
  const { data } = await api.get(`/access/property/${propertyId}`, { params: { limit: 20, cursor } });
  render(data.items);
  cursor = data.nextCursor;
} while (cursor);
```

### 5) Validation code d'accès (afficher messages)
```javascript
const { data } = await api.post('/access/validate', { code: '123456', propertyId });
if (!data.valid) {
  const map = { EXPIRED: 'Code expiré', NOT_STARTED: 'Pas encore actif', CODE_INVALID: 'Code invalide' };
  showToast(map[data.reason] || 'Non valide');
}
```

