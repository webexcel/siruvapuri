@echo off
echo ========================================
echo Complete Setup for Siruvapuri Matrimonial
echo ========================================
echo.

echo Step 1: Installing Backend Dependencies...
cd server
call npm install
cd ..

echo.
echo Step 2: Installing Frontend Dependencies...
cd client
call npm install
cd ..

echo.
echo Step 3: Setting up Database...
echo WARNING: This will create a new database!
pause

psql -U postgres -d postgres -c "DROP DATABASE IF EXISTS matrimonial_db;"
psql -U postgres -d postgres -c "CREATE DATABASE matrimonial_db;"

echo.
echo Step 4: Applying Database Schema...
psql -U postgres -d matrimonial_db -f server\config\schema.sql

echo.
echo Step 5: Creating Admin Account...
cd server
node scripts\createAdmin.js
cd ..

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Admin Login Credentials:
echo   Email: admin@siruvapuri.com
echo   Password: admin123
echo   URL: http://localhost:5173/admin/login
echo.
echo To start the application:
echo   1. Backend:  cd server  && npm start
echo   2. Frontend: cd client  && npm run dev
echo.
pause
