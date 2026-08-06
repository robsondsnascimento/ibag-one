Write-Host "Encerrando Node..." -ForegroundColor Yellow

Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

Write-Host "Concluído." -ForegroundColor Green
