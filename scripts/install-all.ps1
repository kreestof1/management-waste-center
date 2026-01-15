# Install all dependencies

Write-Host "📦 Installation des dépendances..." -ForegroundColor Green

# Install API dependencies
Write-Host ""
Write-Host "🔧 Installation des dépendances de l'API..." -ForegroundColor Cyan
Set-Location ../api
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors de l'installation des dépendances de l'API" -ForegroundColor Red
    exit 1
}

# Install Frontend dependencies
Write-Host ""
Write-Host "⚛️  Installation des dépendances du Frontend..." -ForegroundColor Cyan
Set-Location ../frontend
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors de l'installation des dépendances du Frontend" -ForegroundColor Red
    exit 1
}

Set-Location ../scripts

Write-Host ""
Write-Host "✅ Toutes les dépendances ont été installées avec succès!" -ForegroundColor Green
Write-Host ""
Write-Host "Vous pouvez maintenant:" -ForegroundColor Yellow
Write-Host "  - Démarrer avec Docker: .\start-dev.ps1" -ForegroundColor White
Write-Host "  - Démarrer en local: .\start-local.ps1" -ForegroundColor White
