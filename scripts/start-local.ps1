# Start local development without Docker

Write-Host "🚀 Démarrage de l'environnement local..." -ForegroundColor Green

# Check if Docker is available
$dockerAvailable = $false
try {
    docker info > $null 2>&1
    if ($LASTEXITCODE -eq 0) {
        $dockerAvailable = $true
    }
} catch {
    $dockerAvailable = $false
}

# Check if MongoDB is running
$mongoRunning = Test-NetConnection -ComputerName localhost -Port 27017 -InformationLevel Quiet -WarningAction SilentlyContinue
if (-not $mongoRunning) {
    Write-Host "⚠️  MongoDB ne semble pas être en cours d'exécution sur le port 27017" -ForegroundColor Yellow
    
    if ($dockerAvailable) {
        Write-Host "🐳 Démarrage de MongoDB via Docker..." -ForegroundColor Green
        Set-Location ..
        docker-compose -f docker-compose.mongodb.yml up -d
        Set-Location scripts
        
        # Wait for MongoDB to be ready
        Write-Host "⏳ Attente du démarrage de MongoDB..." -ForegroundColor Yellow
        $retries = 0
        $maxRetries = 30
        while ($retries -lt $maxRetries) {
            $mongoRunning = Test-NetConnection -ComputerName localhost -Port 27017 -InformationLevel Quiet -WarningAction SilentlyContinue
            if ($mongoRunning) {
                Write-Host "✅ MongoDB est prêt!" -ForegroundColor Green
                break
            }
            Start-Sleep -Seconds 1
            $retries++
        }
        
        if (-not $mongoRunning) {
            Write-Host "❌ Impossible de démarrer MongoDB" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "❌ Docker n'est pas disponible. Veuillez:" -ForegroundColor Red
        Write-Host "   1. Installer et démarrer Docker Desktop, ou" -ForegroundColor Yellow
        Write-Host "   2. Installer MongoDB localement" -ForegroundColor Yellow
        exit 1
    }
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

# Start API in background
Write-Host "🔧 Démarrage de l'API..." -ForegroundColor Green
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd ../api; npm run dev" -WindowStyle Normal

# Wait a bit for API to start
Start-Sleep -Seconds 3

# Start Frontend
Write-Host "⚛️  Démarrage du Frontend..." -ForegroundColor Green
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd ../frontend; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "✅ Environnement local démarré!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Services disponibles:" -ForegroundColor Cyan
Write-Host "   Frontend:    http://localhost:3000" -ForegroundColor White
Write-Host "   API:         http://localhost:5000" -ForegroundColor White
Write-Host "   Swagger:     http://localhost:5000/api-docs" -ForegroundColor White
Write-Host "   API Health:  http://localhost:5000/api/health" -ForegroundColor White
Write-Host ""
Write-Host "💡 Les serveurs s'exécutent dans des fenêtres séparées" -ForegroundColor Yellow
