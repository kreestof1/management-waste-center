
# Spécifications Techniques — Application Suivi de Remplissage

## 1. Architecture

- **Front** : React (Vite), TypeScript, Router, State (Redux Toolkit / Zustand), UI (MUI/Tailwind).
- **API** : Node.js (Express), TypeScript, validation (zod / Joi), sécurité (Helmet, CORS).
- **DB** : MongoDB (Mongoose). Collections : users, recyclingCenters, containerTypes, containers, statusEvents, auditLogs.
- **Temps réel** : Socket.IO (canal `container.status.updated`).
- **Auth** : JWT (access + refresh), RBAC.
- **Reverse proxy** : Nginx.
- **Conteneurisation** : Docker + docker‑compose (dev), images multi‑stage (prod).
- **CI/CD** : GitHub Actions / Azure DevOps (lint, tests, build, scan, déploiement).
- **Observabilité** : Winston + OpenTelemetry, métriques Prometheus, dashboards Grafana.

## 2. Modèle de Données (MongoDB)

### 2.1 users

```json
{
  "_id": "ObjectId",
  "email": "string",
  "passwordHash": "string",
  "role": "visitor|user|agent|manager|superadmin",
  "centerIds": ["ObjectId"],
  "createdAt": "Date",
  "lastLoginAt": "Date",
  "preferences": { "locale": "fr-FR" }
}
```

### 2.2 recyclingCenters

```json
{
  "_id": "ObjectId",
  "name": "string",
  "address": "string",
  "geo": { "lat": "number", "lng": "number" },
  "publicVisibility": true,
  "openingHours": [{ "day": "Mon", "open": "09:00", "close": "18:00" }],
  "active": true,
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### 2.3 containerTypes

```json
{ "_id": "ObjectId", "label": "Bois", "icon": "mdi:tree", "color": "#8BC34A" }
```

### 2.4 containers

```json
{
  "_id": "ObjectId",
  "centerId": "ObjectId",
  "typeId": "ObjectId",
  "label": "Ben. Bois #1",
  "capacityLiters": 12000,
  "state": "empty|full|maintenance",
  "locationHint": "Allée A",
  "active": true,
  "updatedAt": "Date"
}
```

### 2.5 statusEvents

```json
{
  "_id": "ObjectId",
  "containerId": "ObjectId",
  "newState": "empty|full",
  "authorId": "ObjectId|null",
  "source": "user|agent|manager|sensor|import",
  "comment": "string",
  "evidence": { "photoUrl": "string" },
  "confidence": 1.0,
  "createdAt": "Date"
}
```

### 2.6 auditLogs

```json
{
  "_id": "ObjectId",
  "actorId": "ObjectId|null",
  "action": "CONTAINER_SET_FULL|CONTAINER_SET_EMPTY|CONTAINER_MAINTENANCE_ON|...",
  "entityType": "container|center|type|user",
  "entityId": "ObjectId",
  "metadata": {},
  "createdAt": "Date"
}
```

## 3. Règles & Algorithmes

### 3.1 Détermination de l’état courant

- Par défaut : **dernier événement valide** par `createdAt`.
- Option quorum : calculer la majorité sur les **N** derniers événements (N=5 par défaut, fenêtre 2 h).

### 3.2 Anti‑rebond / anti‑spam

- Rejeter une seconde déclaration d’un même `authorId` sur le même `containerId` dans un TTL de **60 s** (clé Redis `throttle:{authorId}:{containerId}`).

### 3.3 Maintenance

- Si `state === "maintenance"`, seules les actions gérant/super‑admin sont acceptées.

## 4. API (REST + WebSocket)

### 4.1 Auth

- `POST /api/auth/login` → `{ accessToken, refreshToken }`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`

### 4.2 Utilisateurs (RBAC)

- `GET /api/users/me`
- `GET /api/users` (manager/superadmin)
- `POST /api/users` (manager/superadmin)

### 4.3 Déchèteries

- `GET /api/centers`
- `POST /api/centers` (manager)
- `PUT /api/centers/:id` (manager)

### 4.4 Types de déchets

- `GET /api/container-types`
- `POST /api/container-types` (manager)

### 4.5 Conteneurs

- `GET /api/centers/:centerId/containers?state=full|empty`
- `POST /api/containers` (manager)
- `PUT /api/containers/:id` (manager)
- `POST /api/containers/:id/status`  _(déclare vide/plein)_
  - Request:

    ```json
    { "newState": "full", "comment": "Au ras", "evidence": { "photoUrl": null } }
    ```

  - Response:

    ```json
    { "containerId": "...", "state": "full", "updatedAt": "2026-01-15T16:30:00Z" }
    ```

### 4.6 Historique

- `GET /api/containers/:id/events?limit=100&from=...&to=...`

### 4.7 WebSocket (Socket.IO)

- Canal `container.status.updated` → payload:

```json
{ "containerId": "ObjectId", "state": "full|empty", "updatedAt": "Date" }
```

### 4.8 Erreurs (extraits)

- 400 `VALIDATION_ERROR`
- 401 `UNAUTHORIZED`
- 403 `FORBIDDEN`
- 404 `NOT_FOUND`
- 409 `CONFLICT_THROTTLED`
- 422 `UNPROCESSABLE_STATE`
- 500 `INTERNAL_ERROR`

### 4.9 OpenAPI (extrait)

```yaml
paths:
  /api/containers/{id}/status:
    post:
      summary: Declare container state
      security: [ { BearerAuth: [] } ]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [ newState ]
              properties:
                newState: { type: string, enum: [full, empty] }
                comment: { type: string }
      responses:
        '200': { description: Updated }
        '409': { description: Throttled }
```

## 5. Sécurité

- **Transport** : HTTPS only, HSTS, TLS 1.2+.
- **AuthN/Z** : JWT (rotation refresh), RBAC par rôle et périmètre (centerIds).
- **En-têtes** : Helmet, CSP (script-src 'self' cdn-ui).
- **Données** : hash PBKDF2/Argon2, salage par utilisateur.
- **Journalisation** : audit immuable (append‑only), horodatage UTC, horloge NTP.
- **Rate limiting** : 100 req/5 min/IP public, 500 req/5 min/IP admin.
- **CORS** : domaines autorisés par env.

## 6. Performance & Scalabilité

- Index MongoDB : `containers.centerId`, `statusEvents.containerId+createdAt desc`.
- Cache en lecture (Redis) pour listes `GET /containers` (TTL 5 s).
- Pagination standard (limit par défaut 20, max 100).
- Tests de charge k6 / Artillery (objectif 200 rps P95 < 300 ms).

## 7. Observabilité

- Logs JSON structurés (correlationId).
- **Metrics** : `containers_full_count`, `events_per_min`, `api_latency_ms`.
- **Dashboards** : temps moyen retour à `empty`, conteneurs souvent `full`.

## 8. Frontend

- **Pages** : Accueil, Liste, Détail Conteneur, Admin, Connexion.
- **Design system** : couleurs état (vert=`empty`, rouge=`full`, gris=`maintenance`).
- **i18n** : fr-FR, en-GB (react-i18next).
- **Accessibilité** : focus visible, ARIA, contrastes ≥ 4.5:1.

## 9. Dev, Build & Déploiement

- **Branches** : trunk‑based (main) + feature branches.
- **CI** : Lint (ESLint), Types, Tests (Jest/Supertest), Build, SCA (Dependabot).
- **Conteneurs** : multi‑stage (builder → runner), user non‑root.
- **Environnements** : dev, staging, prod (variables .env*).
- **Infra** (exemple) :
  - API + Front : Azure Web App / Docker on VM
  - DB : MongoDB Atlas (VPC peering)
  - Cache : Azure Cache for Redis
  - Proxy : Nginx

## 10. Tests

- **Unitaires** : Jest (front & back).
- **API** : Supertest, Postman collection.
- **E2E** : Cypress (parcours « déclarer plein », « remettre vide »).
- **Sécu** : zap‑baseline, npm audit.
- **Perf** : Artillery/k6 (seuils §6).

## 11. Migrations & Données

- Scripts seed (types de déchets, conteneurs démo).
- Migration soft (scripts idempotents) via `npm run migrate`.

## 12. Opérations

- Sauvegardes Mongo (point‑in‑time si Atlas).
- Rétention des logs : 90 jours (paramétrable).
- RTO ≤ 4 h, RPO ≤ 1 h (cible v1).
- Procédure d’escalade (on‑call), runbook incidents.

## 13. Roadmap Technique

- V1.1 : Webhooks d’alertes « plein », export XLSX, seuil « presque plein ».
- V2 : Intégration capteurs IoT, notifications push, prévision ML.
