# 📑 Pagination Cursor-Based

## Pourquoi
- Performance et stabilité sur gros volumes (mieux que limit/offset)
- Pas de "sauts"/doublons quand des lignes sont ajoutées/supprimées en cours de navigation

## Paramètres
- `limit` (1..100): taille de page (défaut 20)
- `cursor` (cuid): identifiant du dernier élément de la page précédente
- Optionnel `type` pour lock events (ex: `ACCESS_GRANTED`)

## Réponse
- `items` ou `events`: liste de résultats
- `nextCursor`: cursor pour charger la page suivante (null s'il n'y en a plus)
- `hasMore`: booléen indiquant s'il reste des pages

## Endpoints
- `GET /api/access/my-accesses?limit=20&cursor=<cuid>`
- `GET /api/access/property/:propertyId?limit=20&cursor=<cuid>`
- `GET /api/lock/events/:propertyId?limit=20&cursor=<cuid>&type=LOCK_STATUS_CHECK`

## Exemple
1) Première page (sans cursor)
```
GET /api/access/property/ckx123...abc?limit=20
```
Réponse:
```
{
  "data": {
    "accesses": [ ...20 éléments... ],
    "nextCursor": "ckx456...xyz",
    "hasMore": true
  }
}
```

2) Page suivante
```
GET /api/access/property/ckx123...abc?limit=20&cursor=ckx456...xyz
```

## Notes d’implémentation
- Tri par `id DESC` pour un cursorage stable et indexable
- Index utiles:
  - `@@index([propertyId, isActive])` (`accesses`)
  - `@@index([userId, isActive])` (`accesses`)
  - `@@index([propertyId, timestamp])` (`lock_events`)
- Cache invalide par motif lors des créations/suppressions d’accès: `access:property:${propertyId}*`

## Performances observées (dev local)
- `GET /api/access/property/:propertyId` (10 pages x 50): p50 ≈ 26 ms, p95 ≈ 36 ms, p99 ≈ 36 ms
- `GET /api/lock/events/:propertyId` (10 pages x 50): p50 ≈ 45 ms, p95 ≈ 50 ms, p99 ≈ 50 ms
- Remarque: les premières requêtes par page sont des miss cache; répéter la même page déclenche des hits.
