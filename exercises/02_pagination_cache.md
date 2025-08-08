# 02 - Pagination & Cache

1) Génére ≥ 30 accès (en plusieurs appels) pour ta propriété.
2) Appelle `GET /access/property/{propertyId}?limit=10`:
   - a) Note `nextCursor` et `hasMore`.
   - b) Récupère la page suivante avec `cursor=...`.
3) Répète 2 fois la même requête sur la même page. Regarde `/api/metrics` avant/après:
   - a) `app_cache_hits` a-t-il augmenté ?
   - b) `app_cache_misses` a-t-il augmenté lors du premier appel seulement ?
4) Explique en 2 phrases pourquoi la pagination par curseur est plus stable que `limit/offset`.

