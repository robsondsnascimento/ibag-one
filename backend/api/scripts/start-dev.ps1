Clear-Host

Write-Host ""
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "             PROJECT NEHEMIAH - DEV LAUNCHER             " -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host ""

# =========================================================
# Caminhos
# =========================================================

$Root = Resolve-Path "$PSScriptRoot\.."
$Api = Join-Path $Root "backend\api"

Write-Host "Projeto:" $Root -ForegroundColor DarkGray
Write-Host ""

# =========================================================
# Entrando na API
# =========================================================

Set-Location $Api

# =========================================================
# Verificando .env
# =========================================================

Write-Host "[1/7] Verificando .env..." -ForegroundColor Yellow

if (!(Test-Path ".env")) {

    Write-Host ""
    Write-Host "ERRO: arquivo .env não encontrado." -ForegroundColor Red
    Write-Host ""
    Write-Host "Crie o arquivo .env antes de iniciar a aplicação."
    exit
}

Write-Host "OK" -ForegroundColor Green

# =========================================================
# Verificando Node
# =========================================================

Write-Host ""
Write-Host "[2/7] Verificando Node..." -ForegroundColor Yellow

node --version

if ($LASTEXITCODE -ne 0) {
    Write-Host "Node não encontrado." -ForegroundColor Red
    exit
}

Write-Host "OK" -ForegroundColor Green

# =========================================================
# Gerando Prisma Client
# =========================================================

Write-Host ""
Write-Host "[3/7] Gerando Prisma Client..." -ForegroundColor Yellow

npx prisma generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro ao gerar Prisma Client." -ForegroundColor Red
    exit
}

Write-Host "OK" -ForegroundColor Green

# =========================================================
# Verificando Banco
# =========================================================

Write-Host ""
Write-Host "[4/7] Verificando conexão com PostgreSQL..." -ForegroundColor Yellow

npx prisma migrate status

if ($LASTEXITCODE -ne 0) {

    Write-Host ""
    Write-Host "ATENÇÃO!" -ForegroundColor Red
    Write-Host "O PostgreSQL provavelmente não está iniciado."
    Write-Host ""
    Pause
    exit
}

Write-Host "OK" -ForegroundColor Green

# =========================================================
# Prisma Studio
# =========================================================

Write-Host ""
Write-Host "[5/7] Abrindo Prisma Studio..." -ForegroundColor Yellow

Start-Process powershell `
-ArgumentList "-NoExit","-Command","cd '$Api'; npx prisma studio"

Start-Sleep -Seconds 3

Write-Host "OK" -ForegroundColor Green

# =========================================================
# Bruno
# =========================================================

Write-Host ""
Write-Host "[6/7] Abrindo Bruno..." -ForegroundColor Yellow

$Bruno = "${env:LOCALAPPDATA}\Programs\Bruno\Bruno.exe"

if (Test-Path $Bruno) {

    Start-Process $Bruno
    Write-Host "OK" -ForegroundColor Green

}
else {

    Write-Host "Bruno não encontrado. Ignorando..." -ForegroundColor DarkYellow

}

# =========================================================
# API
# =========================================================

Write-Host ""
Write-Host "[7/7] Iniciando API..." -ForegroundColor Yellow
Write-Host ""

npm run start:dev
