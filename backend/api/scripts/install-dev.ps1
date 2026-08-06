Clear-Host

Write-Host ""
Write-Host "========================================================="
Write-Host "        PROJECT NEHEMIAH - INSTALL DEV ENVIRONMENT"
Write-Host "========================================================="
Write-Host ""

$Root = Resolve-Path "$PSScriptRoot\.."
$Api = Join-Path $Root "backend\api"

Set-Location $Api

Write-Host "Instalando dependências..." -ForegroundColor Yellow

npm install

Write-Host ""
Write-Host "Gerando Prisma Client..." -ForegroundColor Yellow

npx prisma generate

Write-Host ""
Write-Host "Verificando migrations..." -ForegroundColor Yellow

npx prisma migrate status

Write-Host ""
Write-Host "Instalação concluída." -ForegroundColor Green
