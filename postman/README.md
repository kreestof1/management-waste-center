# Collection Postman - Management Waste Center

Cette collection Postman contient toutes les requêtes API pour tester l'application de gestion de centre de traitement des déchets.

## 📦 Import dans Postman

1. Ouvrir Postman
2. Cliquer sur **Import**
3. Sélectionner le fichier `management-waste-center.postman_collection.json`
4. Importer également les environnements :
   - `development.postman_environment.json`
   - `production.postman_environment.json`

## 🔧 Configuration

### Variables d'Environnement

**Development**
- `base_url`: http://localhost:5000
- `waste_id`: (sera rempli automatiquement après création)

**Production**
- `base_url`: https://api.yourdomain.com
- `waste_id`: (sera rempli automatiquement après création)

## 📚 Endpoints Disponibles

### Health Check
- **GET** `/api/health` - Vérifier le statut de l'API

### Wastes Management

#### Liste des Déchets
- **GET** `/api/wastes` - Récupérer tous les déchets
- **GET** `/api/wastes?status=collected&type=plastic` - Filtrer les déchets

Paramètres de requête disponibles:
- `status`: collected | processing | processed | recycled
- `type`: plastic | glass | paper | metal | organic | electronic | hazardous | other
- `startDate`: Date au format ISO (ex: 2026-01-01)
- `endDate`: Date au format ISO (ex: 2026-12-31)

#### Déchet Spécifique
- **GET** `/api/wastes/:id` - Récupérer un déchet par ID
- **POST** `/api/wastes` - Créer un nouveau déchet
- **PUT** `/api/wastes/:id` - Mettre à jour un déchet
- **DELETE** `/api/wastes/:id` - Supprimer un déchet

#### Statistiques
- **GET** `/api/wastes/stats` - Récupérer les statistiques globales

## 📝 Exemples de Payloads

### Créer un Déchet
```json
{
  "type": "plastic",
  "weight": 25.5,
  "collectionDate": "2026-01-15T10:00:00Z",
  "status": "collected",
  "description": "Bouteilles plastiques collectées",
  "location": "Zone A - Conteneur 3"
}
```

### Mettre à Jour un Déchet
```json
{
  "status": "processing",
  "description": "En cours de traitement"
}
```

## 🧪 Tests Automatisés

Chaque requête inclut des tests automatiques pour vérifier:
- Le code de statut HTTP
- La structure de la réponse
- Les données retournées

## 🚀 Utilisation Rapide

1. Sélectionner l'environnement **Development**
2. Lancer **Health Check** pour vérifier la connexion
3. Créer un déchet avec **Create Waste**
4. L'ID sera automatiquement sauvegardé dans `waste_id`
5. Tester les autres endpoints avec cet ID

## 📊 Workflow Recommandé

1. Health Check
2. Create Waste (sauvegarde l'ID)
3. Get All Wastes
4. Get Waste by ID
5. Update Waste
6. Get Waste Statistics
7. Delete Waste
