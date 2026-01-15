#!/bin/bash

# Start local development without Docker

echo "🚀 Démarrage de l'environnement local..."

# Check if MongoDB is running
if ! nc -z localhost 27017 2>/dev/null; then
    echo "⚠️  MongoDB ne semble pas être en cours d'exécution sur le port 27017"
    echo "   Assurez-vous que MongoDB est installé et démarré"
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

# Start API in background
echo "🔧 Démarrage de l'API..."
cd ../api
npm run dev &
API_PID=$!

# Wait a bit for API to start
sleep 3

# Start Frontend
echo "⚛️  Démarrage du Frontend..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

cd ../scripts

echo ""
echo "✅ Environnement local démarré!"
echo ""
echo "📍 Services disponibles:"
echo "   Frontend: http://localhost:3000"
echo "   API:      http://localhost:5000"
echo ""
echo "💡 PIDs des processus:"
echo "   API: $API_PID"
echo "   Frontend: $FRONTEND_PID"
echo ""
echo "Pour arrêter: kill $API_PID $FRONTEND_PID"
