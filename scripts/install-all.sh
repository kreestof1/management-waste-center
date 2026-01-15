#!/bin/bash

# Install all dependencies

echo "📦 Installation des dépendances..."

# Install API dependencies
echo ""
echo "🔧 Installation des dépendances de l'API..."
cd ../api
npm install

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de l'installation des dépendances de l'API"
    exit 1
fi

# Install Frontend dependencies
echo ""
echo "⚛️  Installation des dépendances du Frontend..."
cd ../frontend
npm install

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de l'installation des dépendances du Frontend"
    exit 1
fi

cd ../scripts

echo ""
echo "✅ Toutes les dépendances ont été installées avec succès!"
echo ""
echo "Vous pouvez maintenant:"
echo "  - Démarrer avec Docker: ./start-dev.sh"
echo "  - Démarrer en local: ./start-local.sh"

# Make scripts executable
chmod +x start-dev.sh
chmod +x start-local.sh
