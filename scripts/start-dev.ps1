# Start development environment with Docker Compose

Write-Host "🚀 Démarrage de l'environnement de développement..." -ForegroundColor Green

# Check if Docker is running
$dockerRunning = docker info 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker n'est pas en cours d'exécution. Veuillez démarrer Docker Desktop." -ForegroundColor Red
    exit 1
}

# Create .env files if they don't exist
if (-not (Test-Path "../api/.env")) {
    Write-Host "📝 Création du fichier .env pour l'API..." -ForegroundColor Yellow
    Copy-Item "../api/.env.example" "../api/.env"
}

if (-not (Test-Path "../frontend/.env")) {
    Write-Host "📝 Création du fichier .env pour le frontend..." -ForegroundColor Yellow
    Copy-Item "../frontend/.env.example" "../frontend/.env"
}

# Start Docker Compose
Write-Host "🐳 Démarrage des conteneurs Docker..." -ForegroundColor Green
Set-Location ..
docker-compose -f docker-compose.dev.yml up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Environnement de développement démarré avec succès!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📍 Services disponibles:" -ForegroundColor Cyan
    Write-Host "   Frontend:    http://localhost:3000" -ForegroundColor White
    Write-Host "   API:         http://localhost:5000" -ForegroundColor White
    Write-Host "   Swagger:     http://localhost:5000/api-docs" -ForegroundColor White
    Write-Host "   API Health:  http://localhost:5000/api/health" -ForegroundColor White
    Write-Host "   MongoDB:     localhost:27017" -ForegroundColor White
    Write-Host ""
    Write-Host "📊 Pour voir les logs: docker-compose -f docker-compose.dev.yml logs -f" -ForegroundColor Yellow
    Write-Host "🛑 Pour arrêter: docker-compose -f docker-compose.dev.yml down" -ForegroundColor Yellow
} else {
    Write-Host "❌ Erreur lors du démarrage des conteneurs" -ForegroundColor Red
}
