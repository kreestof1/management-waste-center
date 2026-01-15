# Management Waste Center

Application de gestion de centre de traitement des déchets avec frontend React et API Node.js.

## 🏗️ Structure du Projet

```
management-waste-center/
├── frontend/          # Application React + Vite + MUI
├── api/              # API Node.js + Express + TypeScript + Mongoose
├── infra/            # Configuration Docker et Nginx
├── documentation/    # Spécifications et documentation
├── .github/          # Workflows CI/CD
└── docker-compose.yml
```

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 18+
- Docker & Docker Compose
- MongoDB (ou utiliser le container Docker)

### Installation et Démarrage

1. **Cloner le dépôt**

   ```bash
   git clone <repository-url>
   cd management-waste-center
   ```

2. **Configuration des variables d'environnement**

   ```bash
   # API
   cp api/.env.example api/.env
   
   # Frontend
   cp frontend/.env.example frontend/.env
   ```

3. **Démarrage avec Docker**

   ```bash
   docker-compose up -d
   ```

   L'application sera accessible sur:
   - Frontend: <http://localhost:3000>
   - API: <http://localhost:5000>   - API Docs (Swagger): http://localhost:5000/api-docs   - MongoDB: localhost:27017

4. **Démarrage en développement local**

   Avec les scripts (recommandé) :

   ```bash
   cd scripts
   .\install-all.ps1    # Windows
   # ou ./install-all.sh  # Linux/Mac
   
   .\start-local.ps1    # Démarre MongoDB (Docker) + API + Frontend
   ```

   Ou manuellement :

   ```bash
   # Terminal 1 - MongoDB
   docker-compose -f docker-compose.mongodb.yml up -d
   
   # Terminal 2 - API
   cd api
   npm install
   npm run dev
   
   # Terminal 3 - Frontend
   cd frontend
   npm install
   npm run dev
   ```

## 📦 Technologies

### Frontend

- React 18
- Vite
- Material-UI (MUI)
- Axios
- React Router

### Backend

- Node.js
- Express
- TypeScript
- MongoDB & Mongoose
- JWT Authentication

### Infrastructure

- Docker & Docker Compose
- Nginx (reverse proxy)
- MongoDB

## 🧪 Tests

```bash
# Tests API
cd api
npm test

# Tests Frontend
cd frontend
npm test
```

## 📚 Documentation

- [Spécifications Fonctionnelles](./documentation/specifications-fonctionnelles.md)
- [Spécifications Techniques](./documentation/specifications-techniques.md)
- [API Documentation (Swagger)](http://localhost:5000/api-docs) - Une fois l'API démarrée
- [Collection Postman](./postman/management-waste-center.postman_collection.json)

## 🔧 Scripts Disponibles

### API

- `npm run dev` - Démarrage en mode développement
- `npm run build` - Compilation TypeScript
- `npm start` - Démarrage en production
- `npm test` - Exécution des tests

### Frontend

- `npm run dev` - Démarrage serveur de développement
- `npm run build` - Build pour production
- `npm run preview` - Preview du build
- `npm test` - Exécution des tests

## 🐳 Docker

```bash
# Environnement complet (production)
docker-compose up --build
docker-compose up -d          # En arrière-plan
docker-compose down           # Arrêt

# Environnement de développement
docker-compose -f docker-compose.dev.yml up -d

# MongoDB uniquement (pour développement local)
docker-compose -f docker-compose.mongodb.yml up -d
docker-compose -f docker-compose.mongodb.yml down

# Logs
docker-compose logs -f
```

## 🔧 Dépannage

**Erreur de connexion MongoDB :**

```bash
# Vérifier si MongoDB tourne
docker ps | grep mongo

# Démarrer MongoDB
docker-compose -f docker-compose.mongodb.yml up -d

# Vérifier les logs
docker-compose -f docker-compose.mongodb.yml logs -f
```

## 📝 License

MIT
