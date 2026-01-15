# Management Waste Center - API

API REST pour la gestion de centre de traitement des déchets.

## 📚 Documentation

### Swagger UI

Une fois l'API démarrée, accédez à la documentation interactive Swagger :

- **URL**: <http://localhost:5000/api-docs>

La documentation Swagger vous permet de :

- 📖 Consulter tous les endpoints disponibles
- 🧪 Tester les API directement depuis l'interface
- 📋 Voir les schémas de données (request/response)
- ✅ Valider les paramètres et le body des requêtes

### Collection Postman

Une collection Postman complète est également disponible dans le dossier `/postman`.

## 🚀 Démarrage

```bash
# Installation
npm install

# Développement
npm run dev

# Production
npm run build
npm start
```

## 🔗 Endpoints Principaux

### Health Check

- `GET /api/health` - Vérifier le statut de l'API

### Wastes Management

- `GET /api/wastes` - Liste tous les déchets (avec filtres)
- `GET /api/wastes/stats` - Statistiques globales
- `GET /api/wastes/:id` - Détails d'un déchet
- `POST /api/wastes` - Créer un déchet
- `PUT /api/wastes/:id` - Mettre à jour un déchet
- `DELETE /api/wastes/:id` - Supprimer un déchet

## 📊 Exemples

### Créer un Déchet

```bash
POST /api/wastes
Content-Type: application/json

{
  "type": "plastic",
  "weight": 25.5,
  "collectionDate": "2026-01-15T10:00:00Z",
  "status": "collected",
  "description": "Bouteilles plastiques",
  "location": "Zone A"
}
```

### Filtrer les Déchets

```bash
GET /api/wastes?status=collected&type=plastic&startDate=2026-01-01&endDate=2026-12-31
```

## 🔧 Variables d'Environnement

Créer un fichier `.env` basé sur `.env.example` :

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/waste-management
JWT_SECRET=your-secret-key
```

## 🛠️ Technologies

- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- Swagger (documentation API)
- Helmet (sécurité)
- CORS
- Morgan (logs)
