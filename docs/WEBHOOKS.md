# Webhooks – Pourquoi et comment

## C’est quoi un webhook ?
Un webhook est un appel HTTP sortant envoyé par notre backend vers une URL fournie par un client/partenaire pour l’informer en temps réel d’un événement (au lieu d’attendre qu’il « vienne demander » via polling).

## Pourquoi c’est utile dans Smart Lock SaaS
- Notifications immédiates aux intégrations (CRM, front, dashboards) lorsqu’il se passe quelque chose d’important:
  - access_created, access_revoked
  - lock_battery_low
  - access_attempt_expired
- Réduit le polling et la latence de propagation des infos
- Créé de la valeur pour l’écosystème (intégrations no-code/low-code, automatisations)

## Composants clés (bonne pratique)
- Signature HMAC: prouve que l’événement vient bien de nous et qu’il n’a pas été altéré
- Idempotency: éviter de traiter deux fois le même événement en cas de re-livraison
- Retry + backoff: si le récepteur est down, on retente proprement (BullMQ)
- Logs + métriques: suivre les réussites/échecs, latences, taux d’erreur

## Format d’événement (exemple JSON)
```json
{
  "id": "evt_01HXYZ",
  "type": "access_revoked",
  "occurredAt": "2025-08-08T20:56:36.123Z",
  "data": {
    "accessId": "acc_123",
    "propertyId": "prop_456",
    "revokedBy": "owner_789"
  }
}
```

Headers envoyés (exemple):
- X-Webhook-Id: evt_01HXYZ
- X-Webhook-Timestamp: 1723140996
- X-Webhook-Signature: sha256=ab12cd34...
- Idempotency-Key: evt_01HXYZ

## Vérification de signature (Node.js, pseudo-code)
```js
const crypto = require('crypto');

function verifySignature(rawBody, timestamp, signature, secret) {
  const payload = `${timestamp}.${rawBody}`;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'));
}
```

Côté récepteur: refuser si
- le délai (now - timestamp) > 5 minutes
- la signature ne correspond pas

## Idempotency
- Utiliser `Idempotency-Key` (ex: l’id d’événement) côté récepteur pour ne traiter qu’une seule fois
- Stocker les clés traitées pendant une durée (ex: 24h)

## Retry & backoff (côté envoi)
- 3–5 tentatives, backoff exponentiel (ex: 1s, 10s, 60s, 5min)
- Abandonner après N tentatives et journaliser l’échec (avec métriques)

## Sécurité – check-list
- HTTPS obligatoire
- Signature HMAC (secret par destination)
- Validation horodatage (anti-replay)
- Idempotency côté récepteur
- Limiter et filtrer les IP si possible

## Intégration prévue dans ce projet
- Service: `webhookService` (génère événements + signature)
- Queue: `webhookQueue` (BullMQ, retry/backoff)
- Admin: endpoints pour gérer destinations et secrets
- Métriques: compteurs succès/échecs, histogramme durée livraison

---

Courte réponse: les webhooks servent à prévenir tes systèmes/partenaires en temps réel d’événements (ex: révocation d’accès), de façon sécurisée (HMAC), fiable (retry), et sans double-traitement (idempotency).