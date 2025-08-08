# 04 - Lock Events & Metrics

1) Appelle 5 fois `GET /lock/status/{propertyId}` et observe:
   - a) Dans l'historique des événements (LOCK_STATUS_CHECK, BATTERY_LOW éventuels)
   - b) Dans `/api/metrics`: `business_lock_status_checks_total`
2) Explique la différence entre `http_requests_total` et `business_lock_status_checks_total`.
3) Donne une alerte (règle) que tu mettrais en place à partir des métriques disponibles.

