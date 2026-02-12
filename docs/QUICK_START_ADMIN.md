# Quick Start Guide - Admin Panel

## Setup (One-Time)

### 1. Install Dependencies
```bash
# Frontend
cd client
npm install

# Backend
cd server
npm install
```

### 2. Setup Database
```bash
# Create database
psql -U postgres -d postgres -c "CREATE DATABASE matrimonial_db;"

# Run schema
psql -U postgres -d matrimonial_db -f config/schema.sql
```

### 3. Create Admin Account
```bash
cd server
node scripts/createAdmin.js
```

**Default Credentials:**
- Email: `admin@siruvapuri.com`
- Password: `admin123`

### 4. Start Servers
```bash
# Terminal 1 - Backend
cd server
npm start

# Terminal 2 - Frontend
cd client
npm run dev
```

## Daily Usage

### Admin Login
1. Go to: http://localhost:5173/admin/login
2. Enter admin email and password
3. Click "Login as Admin"

### Managing New Registrations

#### Step 1: Review User
- User registers on the website
- Admin sees them in the users table
- Check: Name, Email, Phone, Age, Gender

#### Step 2: Mark as Paid
1. Locate user in the table
2. Click "Mark Paid" button in Actions column
3. Payment status badge turns green

#### Step 3: Set Password
1. Scroll to "Set Password for Paid Users" section
2. Select user from dropdown
3. Enter a secure password (min 6 characters)
4. Click "Set Password & Approve User"
5. User is now approved and can login!

### User Login Requirements
For successful user login:
- ✅ Payment status: `paid`
- ✅ Password: set by admin
- ✅ Approved: auto-approved when password is set

## Common Tasks

### Task: Approve Multiple Users

```
For each user:
1. Click "Mark Paid"
2. Select from dropdown
3. Set password
4. Done!
```

### Task: Revoke User Access

```
1. Find user in table
2. Click "Mark Unpaid"
3. User can no longer login
```

### Task: Check User Status

Look at the table columns:
- **Payment Badge:** Green = paid, Red = unpaid
- **Password Icon:** ✓ = set, ✗ = not set
- **Approved Icon:** ✓ = approved, ✗ = not approved

## Shortcuts

| Action | Shortcut |
|--------|----------|
| Admin Login | http://localhost:5173/admin/login |
| Admin Dashboard | http://localhost:5173/admin/dashboard |
| User Registration | http://localhost:5173/register |

## Troubleshooting

### Problem: Can't login as admin
**Solution:** Run `node scripts/createAdmin.js` to create admin account

### Problem: User not in dropdown
**Solution:** Make sure user is marked as "paid" first

### Problem: User can't login
**Solution:** Check that user has:
- Green "paid" badge
- Password icon ✓
- Approved icon ✓

## Password Guidelines

When setting passwords for users:
- Minimum 6 characters
- Mix of letters and numbers recommended
- Avoid common words
- Share password securely with user (phone/email)

## Quick Reference

### User States

| State | Payment | Password | Approved | Can Login? |
|-------|---------|----------|----------|------------|
| New Registration | unpaid | ✗ | ✗ | ❌ |
| Payment Received | paid | ✗ | ✗ | ❌ |
| Password Set | paid | ✓ | ✓ | ✅ |

### Admin Actions Available

1. **View Users** - See all registered users
2. **Mark Paid/Unpaid** - Toggle payment status
3. **Set Password** - Create login credentials for paid users

That's it! You're ready to manage users. 🎉
