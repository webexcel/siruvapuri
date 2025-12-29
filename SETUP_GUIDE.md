# Quick Setup Guide - MatriMatch

Follow these steps to get your matrimonial application running in minutes!

## Step 1: Install Backend Dependencies

```bash
cd server
npm install
```

## Step 2: Setup PostgreSQL Database

1. Make sure PostgreSQL is running on your system
2. Open psql or pgAdmin
3. Execute the schema file:

```bash
# Using psql
psql -U postgres -d postgres -c "CREATE DATABASE matrimonial_db;"
psql -U postgres -d matrimonial_db -f config/schema.sql
```

Or manually in psql:
```sql
psql -U postgres
CREATE DATABASE matrimonial_db;
\c matrimonial_db
\i C:/projects/siruvapuri_new/server/config/schema.sql
\q
```

## Step 3: Configure Environment Variables

The `.env` file is already created in `server/` folder. Update it if needed:

```env
DB_USER=postgres
DB_PASSWORD=your_postgres_password_here
DB_PORT=5432
```

## Step 4: Seed Sample Data

```bash
# Make sure you're in the server folder
node seed.js
```

This will create 8 sample users with complete profiles.

## Step 5: Start Backend Server

```bash
npm start
```

You should see:
```
Connected to PostgreSQL database
Server is running on port 5000
Environment: development
```

## Step 6: Install Frontend Dependencies

Open a NEW terminal window:

```bash
cd client
npm install
```

## Step 7: Start Frontend Development Server

```bash
npm run dev
```

You should see:
```
VITE v7.2.4  ready in XXX ms

➜  Local:   http://localhost:5173/
```

## Step 8: Access the Application

Open your browser and go to: **http://localhost:5173**

## Test Credentials

After seeding, use these accounts to login:

**Male Account:**
- Email: `john.doe@example.com`
- Password: `password123`

**Female Account:**
- Email: `priya.sharma@example.com`
- Password: `password123`

## Verify Everything is Working

1. ✅ Backend running on http://localhost:5000
2. ✅ Frontend running on http://localhost:5173
3. ✅ Can register new user
4. ✅ Can login with test credentials
5. ✅ Can see dashboard with recommendations
6. ✅ Can search profiles
7. ✅ Can view profile details
8. ✅ Can send interests

## Troubleshooting

### PostgreSQL Connection Error
- Check if PostgreSQL is running
- Verify DB_PASSWORD and DB_USER in server/.env
- Make sure database 'matrimonial_db' exists
- Check DB_PORT is correct (default: 5432)

### Port Already in Use
- Backend: Change PORT in server/.env
- Frontend: Will auto-assign different port

### Module Not Found
```bash
# In server folder
npm install

# In client folder
npm install
```

## Next Steps

1. Customize the color scheme in `client/src/index.css` (TailwindCSS v4 uses CSS-based config)
2. Add your logo/branding
3. Add more features like:
   - Photo upload functionality
   - Chat messaging
   - Email notifications
   - Payment integration
   - Admin panel

## Need Help?

Check the main README.md for detailed documentation.

Happy matchmaking! 💚
