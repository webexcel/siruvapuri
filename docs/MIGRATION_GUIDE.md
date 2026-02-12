# Migration Guide: MySQL → PostgreSQL & TailwindCSS v4

## Overview

This document outlines the migration from MySQL to PostgreSQL and the upgrade to TailwindCSS v4.

## Database Migration: MySQL → PostgreSQL

### Key Changes

#### 1. **Query Parameter Syntax**
**Before (MySQL):**
```javascript
await db.query('SELECT * FROM users WHERE email = ?', [email]);
```

**After (PostgreSQL):**
```javascript
await db.query('SELECT * FROM users WHERE email = $1', [email]);
```

#### 2. **Result Handling**
**Before (MySQL):**
```javascript
const [users] = await db.query('SELECT * FROM users');
const user = users[0];
```

**After (PostgreSQL):**
```javascript
const users = await db.query('SELECT * FROM users');
const user = users.rows[0];
```

#### 3. **Getting Inserted IDs**
**Before (MySQL):**
```javascript
const [result] = await db.query('INSERT INTO users ...');
const userId = result.insertId;
```

**After (PostgreSQL):**
```javascript
const result = await db.query('INSERT INTO users ... RETURNING id');
const userId = result.rows[0].id;
```

#### 4. **Age Calculation**
**Before (MySQL):**
```sql
TIMESTAMPDIFF(YEAR, u.date_of_birth, CURDATE()) as age
```

**After (PostgreSQL):**
```sql
EXTRACT(YEAR FROM AGE(CURRENT_DATE, u.date_of_birth))::INTEGER as age
```

#### 5. **Auto-Increment vs SERIAL**
**Before (MySQL):**
```sql
id INT PRIMARY KEY AUTO_INCREMENT
```

**After (PostgreSQL):**
```sql
id SERIAL PRIMARY KEY
```

#### 6. **ENUM vs CHECK Constraints**
**Before (MySQL):**
```sql
gender ENUM('male', 'female', 'other')
```

**After (PostgreSQL):**
```sql
gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other'))
```

### Schema Improvements

Added in PostgreSQL version:
- ✅ Proper indexes for performance
- ✅ Triggers for automatic `updated_at` timestamp updates
- ✅ CASCADE delete constraints
- ✅ Functions for timestamp management

### Files Modified

**Backend:**
- `server/config/database.js` - Complete rewrite for PostgreSQL Pool
- `server/config/schema.sql` - Converted to PostgreSQL syntax
- `server/controllers/authController.js` - All queries updated
- `server/controllers/profileController.js` - All queries updated
- `server/controllers/matchController.js` - All queries updated
- `server/seed.js` - Updated for PostgreSQL
- `server/package.json` - Changed mysql2 → pg
- `server/.env` - Added DB_PORT for PostgreSQL
- `server/.env.example` - Updated template

## TailwindCSS v4 Upgrade

### Key Changes

#### 1. **CSS-Based Configuration**
**Before (TailwindCSS v3 - JavaScript):**

`tailwind.config.js`:
```javascript
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#00D26A',
      },
    },
  },
}
```

**After (TailwindCSS v4 - CSS):**

`src/index.css`:
```css
@import 'tailwindcss';

@theme {
  --color-primary: #00D26A;
  --color-primary-dark: #00B85A;
  --color-primary-light: #33DD89;
}
```

#### 2. **Vite Plugin**
**Before:**
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

**After:**
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

#### 3. **No PostCSS Config Needed**
- ❌ Deleted `postcss.config.js`
- ❌ Removed `autoprefixer` dependency
- ❌ Removed `postcss` dependency

### Files Modified

**Frontend:**
- `client/src/index.css` - Added @theme directive
- `client/vite.config.js` - Added TailwindCSS Vite plugin
- `client/package.json` - Removed autoprefixer & postcss

**Deleted:**
- `client/tailwind.config.js`
- `client/postcss.config.js`

## Environment Variables

### Updated .env Format

```env
# Server Port
PORT=5000

# PostgreSQL Database Configuration
DB_HOST=localhost
DB_PORT=5432              # New: PostgreSQL default port
DB_USER=postgres          # Changed from 'root'
DB_PASSWORD=your_password
DB_NAME=matrimonial_db

# JWT Secret
JWT_SECRET=your_secret_key

# Environment
NODE_ENV=development
```

## Setup Instructions After Migration

### 1. Install PostgreSQL

**Windows:**
```bash
# Download from https://www.postgresql.org/download/windows/
# Or use Chocolatey
choco install postgresql
```

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE matrimonial_db;

# Connect to the database
\c matrimonial_db

# Run schema
\i C:/projects/siruvapuri_new/server/config/schema.sql

# Exit
\q
```

Or using single commands:
```bash
psql -U postgres -d postgres -c "CREATE DATABASE matrimonial_db;"
psql -U postgres -d matrimonial_db -f server/config/schema.sql
```

### 3. Install Dependencies

**Backend:**
```bash
cd server
npm install  # Will install pg instead of mysql2
```

**Frontend:**
```bash
cd client
npm install  # Will use TailwindCSS v4
```

### 4. Configure Environment

Update `server/.env` with your PostgreSQL password:
```env
DB_PASSWORD=your_postgres_password
```

### 5. Seed Data

```bash
cd server
node seed.js
```

### 6. Start Servers

**Backend:**
```bash
cd server
npm start
```

**Frontend:**
```bash
cd client
npm run dev
```

## Benefits of Migration

### PostgreSQL Advantages
- ✅ Better performance for complex queries
- ✅ More advanced indexing options
- ✅ Better JSON support
- ✅ Mature full-text search
- ✅ More robust data integrity
- ✅ Better support for concurrent writes
- ✅ Open source with strong community

### TailwindCSS v4 Advantages
- ✅ Simpler configuration (pure CSS)
- ✅ No JavaScript config file needed
- ✅ Faster build times
- ✅ Better DX (developer experience)
- ✅ Smaller bundle size
- ✅ No PostCSS configuration needed
- ✅ Native CSS features

## Troubleshooting

### PostgreSQL Connection Issues

**Error:** `ECONNREFUSED`
```bash
# Check if PostgreSQL is running
# Windows
Get-Service postgresql*

# macOS/Linux
sudo systemctl status postgresql
```

**Error:** `password authentication failed`
```bash
# Reset password
sudo -u postgres psql
ALTER USER postgres PASSWORD 'newpassword';
```

### TailwindCSS Build Issues

**Error:** `Cannot find module '@tailwindcss/vite'`
```bash
cd client
npm install @tailwindcss/vite@latest
```

## Rollback Instructions

If you need to rollback to MySQL:

```bash
git checkout <commit-hash-before-migration>
cd server
npm install
# Restore MySQL database from backup
```

## Testing Checklist

After migration, verify:
- ✅ User registration works
- ✅ User login works
- ✅ Profile updates save correctly
- ✅ Recommendations load
- ✅ Search filters work
- ✅ Interest sending works
- ✅ Database indexes are created
- ✅ TailwindCSS styles load correctly
- ✅ Custom theme colors work
- ✅ Responsive design works

## Performance Notes

### Database Indexes
The PostgreSQL schema includes optimized indexes:
```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_gender ON users(gender);
CREATE INDEX idx_profiles_city ON profiles(city);
CREATE INDEX idx_profiles_religion ON profiles(religion);
-- ... and more
```

### Query Optimization
PostgreSQL's `EXPLAIN ANALYZE` can help optimize queries:
```sql
EXPLAIN ANALYZE
SELECT * FROM users
WHERE gender = 'female'
AND id IN (SELECT user_id FROM profiles WHERE city = 'Mumbai');
```

## Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [TailwindCSS v4 Documentation](https://tailwindcss.com/docs)
- [pg npm package](https://www.npmjs.com/package/pg)
- [PostgreSQL vs MySQL Comparison](https://www.postgresql.org/about/)

---

**Migration completed successfully!** 🎉

The application is now running on PostgreSQL with TailwindCSS v4.
