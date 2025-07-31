# 📝 Système d'Historique des Événements de Serrure

## Vue d'ensemble

Le système d'historique des événements de serrure permet de tracer et d'auditer toutes les actions effectuées sur les serrures connectées de vos propriétés. Chaque interaction avec une serrure génère automatiquement un événement horodaté avec des détails contextuels.

## 🗄️ Modèle de données

### Table `LockEvent`

```prisma
model LockEvent {
  id          String   @id @default(cuid())
  propertyId  String
  type        String   // Type d'événement
  timestamp   DateTime @default(now())
  details     String?  // Détails contextuels
  
  property    Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)
}
```

## 📋 Types d'événements

| Type | Description | Déclencheur |
|------|-------------|-------------|
| `ACCESS_GRANTED` | Nouvel accès programmé | Création d'un accès |
| `REVOKE` | Accès révoqué | Suppression/révocation d'un accès |
| `LOCK_STATUS_CHECK` | Vérification du statut | Appel API de vérification |
| `BATTERY_LOW` | Batterie faible | Niveau < 20% détecté |
| `MANUAL_LOCK` | Verrouillage manuel | Action physique sur la serrure |

## 🔌 API

### GET `/api/lock/events/:propertyId`

Récupère l'historique des événements pour une propriété.

**Authentification** : Requise (propriétaire uniquement)

**Paramètres URL :**
- `propertyId` (string) : ID de la propriété

**Paramètres Query (optionnels) :**
- `type` (string) : Filtrer par type d'événement
- `limit` (number) : Nombre max d'événements (défaut: 50)

**Exemples :**

```bash
# Tous les événements
GET /api/lock/events/cuid123

# Filtrer par type
GET /api/lock/events/cuid123?type=ACCESS_GRANTED

# Limiter le nombre
GET /api/lock/events/cuid123?limit=10

# Combiner les filtres
GET /api/lock/events/cuid123?type=REVOKE&limit=5
```

**Réponse :**

```json
{
  "success": true,
  "message": "Historique des événements récupéré avec succès",
  "data": {
    "propertyId": "cuid123",
    "events": [
      {
        "id": "event_cuid",
        "type": "ACCESS_GRANTED",
        "timestamp": "2025-01-31T23:11:55.000Z",
        "details": "Code 604797 programmé (TEMPORARY) pour utilisateur cuid456, expire le 2025-08-08"
      }
    ],
    "total": 1,
    "filteredBy": "ACCESS_GRANTED"
  }
}
```

## 🔧 Intégration technique

### Service de logging

```javascript
const lockService = require('./lockService');

// Enregistrer un événement personnalisé
await lockService.logEvent(propertyId, 'MANUAL_LOCK', 'Verrouillage manuel détecté');
```

### Événements automatiques

Les événements suivants sont automatiquement enregistrés :

1. **Lors de la programmation d'un code** (`programAccessCode`)
2. **Lors de la révocation d'un code** (`revokeAccessCode`)  
3. **Lors de la vérification du statut** (`getLockStatus`)
4. **Lors de la détection de batterie faible** (< 20%)

## 🛡️ Sécurité

- **Authentification obligatoire** : Seuls les utilisateurs connectés peuvent accéder aux événements
- **Autorisation propriétaire** : Seul le propriétaire de la propriété peut voir ses événements
- **Validation des paramètres** : Tous les paramètres sont validés avec Zod
- **Isolation des données** : Chaque propriétaire ne voit que ses propres événements

## 📊 Cas d'usage

### 1. Audit de sécurité
```bash
# Voir tous les accès accordés ce mois
GET /api/lock/events/property123?type=ACCESS_GRANTED

# Voir toutes les révocations
GET /api/lock/events/property123?type=REVOKE
```

### 2. Maintenance préventive
```bash
# Détecter les problèmes de batterie
GET /api/lock/events/property123?type=BATTERY_LOW

# Surveiller l'activité de la serrure
GET /api/lock/events/property123?type=LOCK_STATUS_CHECK
```

### 3. Surveillance en temps réel
```bash
# Derniers événements (plus récents en premier)
GET /api/lock/events/property123?limit=20
```

## 🧪 Tests

Le système est testé avec le script `testLockEvents.js` qui valide :

- ✅ Génération automatique d'événements
- ✅ Filtrage par type
- ✅ Limitation du nombre d'événements
- ✅ Sécurité (accès non autorisé)
- ✅ Tri chronologique
- ✅ Détails contextuels

## 🚀 Améliorations futures

- **Notifications** : Alertes en temps réel pour certains événements
- **Graphiques** : Visualisation de l'activité des serrures
- **Export** : Téléchargement des logs au format CSV/PDF
- **Rétention** : Politique de conservation des événements
- **Webhooks** : Intégration avec des services externes

## 📝 Exemple d'utilisation

```javascript
// Dans votre application frontend
const response = await fetch('/api/lock/events/property123?type=ACCESS_GRANTED&limit=10', {
  credentials: 'include' // Inclure les cookies d'auth
});

const data = await response.json();
console.log(`${data.data.total} événements trouvés`);

data.data.events.forEach(event => {
  console.log(`[${event.type}] ${new Date(event.timestamp).toLocaleString()}`);
  console.log(`Détails: ${event.details}`);
});
```

---

**Note** : Ce système d'historique est conçu pour évoluer avec vos besoins. N'hésitez pas à proposer de nouveaux types d'événements ou fonctionnalités selon vos cas d'usage spécifiques. 