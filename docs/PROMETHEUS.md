# Prometheus – Monitoring, métriques et alertes

## C’est quoi Prometheus ?
Prometheus est un système de monitoring open-source avec:
- Base de données time-series (TSDB)
- Pull de métriques sur un endpoint HTTP (format texte)
- Langage de requête PromQL (agrégations, taux, percentiles)
- Alerting via Alertmanager

En clair: ton app expose des métriques sur `/api/metrics`, Prometheus vient les collecter périodiquement, tu analyses (Grafana), et tu déclenches des alertes.

## Dans ce projet
Endpoint d’expo: `GET /api/metrics` (via `prom-client`).

Métriques principales:
- http_requests_total{method,route,status}
- http_request_duration_seconds{method,route,status} (Histogram)
- business_accesses_created_total{propertyId}
- business_access_validate_total{result}
- business_lock_status_checks_total{propertyId}
- business_email_sent_total{type}
- business_email_failed_total{type}
- business_webhook_sent_total{type}
- business_webhook_failed_total{type}
- business_webhook_delivery_seconds{type,status} (Histogram)
- nodejs_process_*, process_cpu_*, etc. (métriques par défaut)

Test rapide local:
```bash
curl -s http://localhost:3000/api/metrics | head -n 40
```

## Config Prometheus (exemple minimal)
`prometheus.yml`:
```yaml
global:
  scrape_interval: 15s
scrape_configs:
  - job_name: smart-lock-api
    metrics_path: /api/metrics
    static_configs:
      - targets: ["localhost:3000"]
```
Lance Prometheus avec cette config et visite `http://localhost:9090`.

## Exemples PromQL utiles
- Taux d’erreur HTTP 5xx sur 5 minutes:
```
sum(rate(http_requests_total{status=~"5.."}[5m]))
  /
sum(rate(http_requests_total[5m]))
```
- p95 latence (tous endpoints):
```
histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))
```
- Emails échoués par minute:
```
sum(rate(business_email_failed_total[1m]))
```
- Webhooks échoués par type (5m):
```
sum(rate(business_webhook_failed_total[5m])) by (type)
```

## Règles d’alerting (exemples)
`alerts.yml`:
```yaml
groups:
- name: smart-lock-alerts
  rules:
  - alert: HighErrorRate
    expr: sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) > 0.05
    for: 10m
    labels: { severity: critical }
    annotations:
      summary: ">5% d’erreurs 5xx sur 10 min"
  - alert: HighLatencyP95
    expr: histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le)) > 1
    for: 10m
    labels: { severity: warning }
    annotations:
      summary: "p95 latence > 1s sur 10 min"
  - alert: EmailFailuresSpike
    expr: sum(rate(business_email_failed_total[5m])) > 1
    for: 5m
    labels: { severity: warning }
    annotations:
      summary: "Spike d’échecs d’emails"
  - alert: WebhookFailures
    expr: sum(rate(business_webhook_failed_total[5m])) by (type) > 0
    for: 10m
    labels: { severity: warning }
    annotations:
      summary: "Des webhooks échouent"
```

## Grafana (optionnel)
- Connecte la source Prometheus, crée des dashboards pour latence, taux d’erreurs, emails/webhooks.
- Import possible de dashboards communautaires pour Node.js/Express.

## Déploiement & docker-compose (piste)
Tu peux ajouter des services `prometheus` et `grafana` dans `docker-compose.yml` (optionnel). Exemple de cible pour Prometheus: `app:3000`, `metrics_path: /api/metrics`.

## Bonnes pratiques
- Nommer/étiqueter les métriques de façon stable (éviter explosion de cardinalité)
- SLO: définir cibles (ex: p95 < 250ms, erreurs < 1%) et alertes associées
- Surveiller la queue d’emails et webhooks (taux d’échecs, latences de livraison)

---
En résumé: Prometheus « aspire » tes métriques à `/api/metrics`, tu les analyses avec PromQL/Grafana, et tu reçois des alertes quand ça dépasse les seuils.