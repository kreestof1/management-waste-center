#!/bin/bash

# Start development environment with Docker Compose

echo "🚀 Démarrage de l'environnement de développement..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker n'est pas en cours d'exécution. Veuillez démarrer Docker."
    exit 1
fi

# Create .env files if they don't exist
if [ ! -f "../api/.env" ]; then
    echo "📝 Création du fichier .env pour l'API..."
    cp ../api/.env.example ../api/.env
fi

if [ ! -f "../frontend/.env" ]; then
    echo "📝 Création du fichier .env pour le frontend..."
    cp ../frontend/.env.example ../frontend/.env
fi

# Start Docker Compose
echo "🐳 Démarrage des conteneurs Docker..."
cd ..
docker-compose -f docker-compose.dev.yml up -d

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Environnement de développement démarré avec succès!"
    echo ""
    echo "📍 Services disponibles:"
    echo "   Frontend: http://localhost:3000"
    echo "   API:      http://localhost:5000"
    echo "   MongoDB:  localhost:27017"
    echo ""
    echo "📊 Pour voir les logs: docker-compose -f docker-compose.dev.yml logs -f"
    echo "🛑 Pour arrêter: docker-compose -f docker-compose.dev.yml down"
else
    echo "❌ Erreur lors du démarrage des conteneurs"
fi
