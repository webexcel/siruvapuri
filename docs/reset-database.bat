@echo off
echo ========================================
echo Resetting Database with New Schema
echo ========================================
echo.
echo WARNING: This will delete all existing data!
echo Press Ctrl+C to cancel or
pause

echo.
echo Dropping and recreating database...
psql -U postgres -d postgres -c "DROP DATABASE IF EXISTS matrimonial_db;"
psql -U postgres -d postgres -c "CREATE DATABASE matrimonial_db;"

echo.
echo Applying schema...
psql -U postgres -d matrimonial_db -f server\config\schema.sql

echo.
echo Creating admin account...
cd server
node scripts\createAdmin.js
cd ..

echo.
echo ========================================
echo Database reset complete!
echo ========================================
echo.
echo Admin credentials:
echo Email: admin@siruvapuri.com
echo Password: admin123
echo.
echo You can now start the server with: npm start
pause
