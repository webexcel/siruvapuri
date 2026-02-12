Write-Host "========================================"
Write-Host "Resetting Database with New Schema"
Write-Host "========================================"
Write-Host ""
Write-Host "WARNING: This will delete all existing data!" -ForegroundColor Red
$confirm = Read-Host "Type 'yes' to continue"

if ($confirm -ne 'yes') {
    Write-Host "Cancelled." -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "Dropping and recreating database..." -ForegroundColor Cyan
psql -U postgres -d postgres -c "DROP DATABASE IF EXISTS matrimonial_db;"
psql -U postgres -d postgres -c "CREATE DATABASE matrimonial_db;"

Write-Host ""
Write-Host "Applying schema..." -ForegroundColor Cyan
psql -U postgres -d matrimonial_db -f server/config/schema.sql

Write-Host ""
Write-Host "Creating admin account..." -ForegroundColor Cyan
Set-Location server
node scripts/createAdmin.js
Set-Location ..

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Database reset complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Admin credentials:"
Write-Host "Email: admin@siruvapuri.com" -ForegroundColor Yellow
Write-Host "Password: admin123" -ForegroundColor Yellow
Write-Host ""
Write-Host "You can now start the server."
