# Admin Panel Quick Start Guide

## Prerequisites

Make sure you have completed the basic setup:
- Node.js installed
- PostgreSQL installed and running
- Database created and schema applied
- Dependencies installed (both client and server)

## Step 1: Start the Servers

### Terminal 1 - Backend Server
```bash
cd server
npm start
```

Server should start on: `http://localhost:5000`

### Terminal 2 - Frontend Development Server
```bash
cd client
npm run dev
```

Frontend should start on: `http://localhost:5173`

## Step 2: Access Admin Panel

1. Open your browser and navigate to:
   ```
   http://localhost:5173/admin/login
   ```

2. Login with default credentials:
   - **Email**: `admin@siruvapuri.com`
   - **Password**: `admin123`

## Step 3: Explore the Admin Panel

### Dashboard
- View platform statistics
- See recent user registrations
- Monitor overall metrics

### User List
- See all registered users
- Try the search functionality
- Filter by status and payment
- Practice toggling payment/approval status

### Create User
- Fill out the form to create a test user
- Try different validation scenarios
- Create users with different approval states

### Matches
- View existing matches
- See match scores and status
- Try filtering and searching

### Assign Match
- Select two approved users
- Set a match score
- Create a manual match

## Testing Scenarios

### Scenario 1: Complete User Registration Flow
1. Create a new user via Register page (frontend)
2. Login to admin panel
3. Find the user in User List
4. Mark user as "Paid"
5. Set password for the user
6. User should now be able to login

### Scenario 2: Admin-Created User
1. Go to Create User page
2. Fill in all required fields
3. Set password and mark as paid/approved
4. User can login immediately

### Scenario 3: Manual Match Assignment
1. Ensure you have at least 2 approved, paid users
2. Go to Assign Match page
3. Select first user
4. Select second user
5. Adjust match score
6. Create the match
7. View the match in Matches page

### Scenario 4: User Management
1. Search for a specific user
2. Filter by approval status
3. Toggle payment status
4. Set password for unpaid user (should show error)
5. Delete a test user

## Common Tasks

### Check Database Records
```sql
-- View all admins
SELECT * FROM admins;

-- View all users
SELECT id, email, first_name, last_name, payment_status, is_approved FROM users;

-- View all matches
SELECT * FROM matches;

-- Count statistics
SELECT
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE is_approved = true) as approved_users,
  COUNT(*) FILTER (WHERE payment_status = 'paid') as paid_users
FROM users;
```

### Reset Admin Password
```bash
cd server
node scripts/createAdmin.js
```

### View Server Logs
Check the terminal where backend is running for:
- API requests
- Database queries
- Error messages

### Check Network Requests
1. Open browser DevTools (F12)
2. Go to Network tab
3. Perform actions in admin panel
4. Review API calls and responses

## Troubleshooting

### Can't Login to Admin Panel
```bash
# Verify admin exists
psql -U postgres -d matrimonial_db -c "SELECT * FROM admins;"

# Recreate admin if needed
cd server
node scripts/createAdmin.js
```

### Dashboard Shows Zero Statistics
```bash
# Add test data
cd server
node seed.js
```

### API Calls Failing
1. Check if backend server is running
2. Verify port 5000 is not blocked
3. Check CORS settings in server.js
4. Review browser console for errors

### Frontend Not Loading
1. Verify frontend is running on port 5173
2. Clear browser cache
3. Check for compilation errors in terminal
4. Verify all dependencies are installed

## API Testing with cURL

### Login as Admin
```bash
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@siruvapuri.com","password":"admin123"}'
```

### Get Dashboard Stats (replace YOUR_TOKEN)
```bash
curl http://localhost:5000/api/admin/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get All Users
```bash
curl http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create User
```bash
curl -X POST http://localhost:5000/api/admin/users/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "email":"test@example.com",
    "first_name":"John",
    "last_name":"Doe",
    "phone":"9876543210",
    "age":28,
    "gender":"male",
    "password":"password123",
    "payment_status":"paid",
    "is_approved":true
  }'
```

## Performance Tips

1. **Use Filters**: When working with large user lists, use search and filters
2. **Database Indexing**: Ensure indexes are created (check schema.sql)
3. **Lazy Loading**: Consider implementing pagination for large datasets
4. **Cache**: Browser should cache static assets

## Security Checklist

- [ ] Changed default admin password
- [ ] JWT_SECRET is secure and not in version control
- [ ] Database credentials are secure
- [ ] CORS is configured properly
- [ ] Input validation is working
- [ ] SQL injection prevention is active
- [ ] Password hashing is working (bcrypt)

## Development Workflow

### Making Changes to Admin Panel

1. **Frontend Changes**:
   ```bash
   cd client
   # Edit files in src/pages/ or src/components/
   # Changes auto-reload with Vite
   ```

2. **Backend Changes**:
   ```bash
   cd server
   # Edit controllers or routes
   # Restart server or use nodemon
   npm run dev  # if nodemon is configured
   ```

3. **Database Schema Changes**:
   ```bash
   # Edit server/config/schema.sql
   # Drop and recreate database
   psql -U postgres -d postgres -c "DROP DATABASE matrimonial_db;"
   psql -U postgres -d postgres -c "CREATE DATABASE matrimonial_db;"
   psql -U postgres -d matrimonial_db -f server/config/schema.sql
   cd server && node scripts/createAdmin.js
   ```

## Next Steps

After successfully testing the admin panel:

1. Customize the admin dashboard with your specific needs
2. Add more statistics and analytics
3. Implement additional features (email notifications, etc.)
4. Set up production environment
5. Configure proper backup procedures
6. Set up monitoring and logging

## Resources

- **Admin Panel Documentation**: See `ADMIN_PANEL_DOCUMENTATION.md`
- **API Documentation**: See `API_DOCUMENTATION.md`
- **General Setup**: See `SETUP_GUIDE.md`
- **Database Schema**: See `server/config/schema.sql`

---

**Happy Admin Panel Testing! 🎉**

If you encounter any issues, check the logs, review the documentation, or inspect the code in the admin components.
