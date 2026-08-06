Clear-Host

$Root = Resolve-Path "$PSScriptRoot\.."
$Api = Join-Path $Root "backend\api"

Set-Location $Root

git pull

Set-Location $Api

npm install

npx prisma generate

Write-Host ""
Write-Host "Projeto atualizado." -ForegroundColor Green
