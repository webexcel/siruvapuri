# Database Setup Instructions

## The Issue

You're getting a 400 error because the database schema needs to be updated with the new structure that supports:
- Separate first_name, middle_name, last_name fields
- Age instead of date_of_birth
- Payment status and approval tracking
- Admin table

## Quick Fix - Reset Database

Choose one of these methods:

### Method 1: Using PowerShell (Recommended for Windows)

```powershell
.\reset-database.ps1
```

### Method 2: Using Batch File

```cmd
reset-database.bat
```

### Method 3: Manual Steps

```bash
# 1. Drop and recreate database
psql -U postgres -d postgres -c "DROP DATABASE IF EXISTS matrimonial_db;"
psql -U postgres -d postgres -c "CREATE DATABASE matrimonial_db;"

# 2. Apply new schema
psql -U postgres -d matrimonial_db -f server/config/schema.sql

# 3. Create admin account
cd server
node scripts/createAdmin.js
```

## After Reset

1. **Start the backend server:**
   ```bash
   cd server
   npm start
   ```

2. **Start the frontend:**
   ```bash
   cd client
   npm run dev
   ```

3. **Test Registration:**
   - Go to http://localhost:5173/register
   - Fill in the new form (no password required)
   - Submit

4. **Test Admin Panel:**
   - Go to http://localhost:5173/admin/login
   - Login with: `admin@siruvapuri.com` / `admin123`
   - Mark user as paid
   - Set password for user
   - User can now login

## What Changed in the Database

### Old Users Table
```sql
- full_name VARCHAR(255)
- password VARCHAR(255) NOT NULL
- date_of_birth DATE
```

### New Users Table
```sql
- first_name VARCHAR(100) NOT NULL
- middle_name VARCHAR(100)
- last_name VARCHAR(100) NOT NULL
- password VARCHAR(255)  -- Now nullable
- age INTEGER NOT NULL
- payment_status VARCHAR(20) DEFAULT 'unpaid'
- is_approved BOOLEAN DEFAULT false
```

### New Admins Table
```sql
CREATE TABLE admins (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Troubleshooting

### Error: "psql: command not found"
**Solution:** Add PostgreSQL to your PATH or use full path:
```
"C:\Program Files\PostgreSQL\15\bin\psql.exe"
```

### Error: "database is being accessed by other users"
**Solution:** Close all database connections and try again, or restart PostgreSQL service

### Error: "permission denied"
**Solution:** Make sure you're running as the postgres user or have proper permissions

### Server still shows errors
**Solution:**
1. Stop the server (Ctrl+C)
2. Reset the database using one of the methods above
3. Restart the server

## Verification

After setup, verify tables exist:
```bash
psql -U postgres -d matrimonial_db -c "\dt"
```

You should see:
- admins
- users
- profiles
- preferences
- matches
- interests
- profile_views

Check users table structure:
```bash
psql -U postgres -d matrimonial_db -c "\d users"
```

You should see the new columns: first_name, middle_name, last_name, age, payment_status, is_approved
