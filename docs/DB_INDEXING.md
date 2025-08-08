## Indexation base de données (SQLite via Prisma)

Objectif: accélérer les requêtes les plus fréquentes liées aux accès et aux événements de serrure.

### Index créés
- `accesses(propertyId, isActive)` → filtre les accès actifs par propriété
- `accesses(userId, isActive)` → filtre les accès actifs par utilisateur
- `lock_events(propertyId, timestamp)` → événements d’une propriété, triables par date

Appliqués via migration `20250808084724_add_indexes`.

### Requêtes ciblées et EXPLAIN
- Q1: Accès par propriété active
  - Requête: `SELECT id FROM accesses WHERE propertyId=? AND isActive=1`
  - EXPLAIN: SEARCH accesses USING INDEX idx_access_property_active (propertyId=? AND isActive=?)

- Q2: Accès par utilisateur actif
  - Requête: `SELECT id FROM accesses WHERE userId=? AND isActive=1`
  - EXPLAIN: SEARCH accesses USING INDEX idx_access_user_active (userId=? AND isActive=?)

- Q3: Événements d’une propriété triés par date (desc)
  - Requête: `SELECT id FROM lock_events WHERE propertyId=? ORDER BY timestamp DESC LIMIT 100`
  - EXPLAIN: SEARCH lock_events USING INDEX idx_lock_events_property_ts (propertyId=?)

### Mesures (dataset de test)
- Dataset: ~100 propriétés, ~10k accès, ~50k événements
- Temps moyens observés:
  - Q1: ~1.2 ms
  - Q2: ~0.8 ms
  - Q3: ~1.3 ms (LIMIT 100)

Script de bench: `scripts/bench_indexes.js` (génère dataset si besoin, exécute EXPLAIN + timings).

### Bonnes pratiques
- Filtrer d’abord par colonnes sélectives et indexées (`propertyId`, `userId`, `isActive`).
- Pour tri par date, combiner filtre par `propertyId` avec index `(propertyId, timestamp)`.
- Éviter `SELECT *` en production; sélectionner les colonnes nécessaires.
- Sur croissance > SQLite, migrer vers PostgreSQL et réévaluer la stratégie d’index.

