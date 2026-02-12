# Admin Panel Guide

## Overview

The Siruvapuri Murguan Matrimonial Service includes a comprehensive admin panel for managing user registrations, payments, and account approvals.

## Key Features

### 1. User Registration Flow

**New Registration Process:**
- Users register WITHOUT providing a password
- Required fields:
  - First Name
  - Middle Name (optional)
  - Last Name
  - Email
  - Phone Number
  - Age
  - Gender
- Users are automatically set to:
  - Payment Status: `unpaid`
  - Approved: `false`
  - Password: `null`

### 2. Admin Responsibilities

1. **Review Registrations**
   - View all registered users in the admin dashboard
   - See user details: name, email, phone, age, gender

2. **Mark Payment Status**
   - Toggle users between `paid` and `unpaid` status
   - Only paid users can have passwords set

3. **Set User Passwords**
   - Select from dropdown of paid users (those without passwords)
   - Set a secure password for the user
   - User is automatically approved when password is set

### 3. User Login Requirements

For a user to successfully login, ALL of the following must be true:
- ✅ Password has been set by admin
- ✅ User is approved (automatic when password is set)
- ✅ Payment status is `paid`

If any condition is not met, users will see an appropriate error message.

## Admin Panel Access

### Login Credentials

**Default Admin Account:**
- Email: `admin@siruvapuri.com`
- Password: `admin123`
- URL: http://localhost:5173/admin/login

⚠️ **SECURITY WARNING:** Change the default password immediately after first login!

### Creating Admin Account

```bash
# Navigate to server directory
cd server

# Run the admin creation script
node scripts/createAdmin.js
```

## Admin Dashboard Features

### Users Table

The admin dashboard displays a comprehensive table with:

| Column | Description |
|--------|-------------|
| Name | Full name (First + Middle + Last) |
| Email | User's email address |
| Phone | Contact number |
| Age | User's age |
| Gender | Male/Female/Other |
| Payment | Badge showing paid/unpaid status |
| Password | Icon indicating if password is set |
| Approved | Icon indicating approval status |
| Actions | Button to toggle payment status |

### Set Password Section

Located at the top of the admin panel:

1. **Select User Dropdown**
   - Shows only paid users without passwords
   - Displays: Name - Email (Phone)

2. **Password Input**
   - Minimum 6 characters
   - Should be secure and shared with user

3. **Submit Button**
   - Sets password in database (hashed with bcrypt)
   - Automatically approves the user
   - User can now login

## Workflow Example

### Complete User Registration Flow

1. **User Registration**
   ```
   John Doe registers on the website
   - First Name: John
   - Middle Name: Kumar
   - Last Name: Doe
   - Email: john@example.com
   - Phone: 9876543210
   - Age: 28
   - Gender: Male
   ```

2. **Initial Status**
   ```
   Payment Status: unpaid
   Approved: false
   Password: null
   ```

3. **Admin Reviews**
   - Admin sees John in the users table
   - Verifies information is legitimate

4. **Payment Received**
   - Admin clicks "Mark Paid" button
   - Payment Status changes to: `paid`

5. **Password Creation**
   - John appears in "Set Password" dropdown
   - Admin selects John from dropdown
   - Admin sets password: "SecurePass123"
   - Clicks "Set Password & Approve User"

6. **Final Status**
   ```
   Payment Status: paid
   Approved: true
   Password: [hashed]
   ```

7. **User Can Login**
   - John receives notification (via phone/email - to be implemented)
   - John logs in with: john@example.com / SecurePass123
   - Access granted to full platform

## Database Schema

### Users Table Structure

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255), -- Nullable until admin sets it
  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  age INTEGER NOT NULL,
  gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  payment_status VARCHAR(20) DEFAULT 'unpaid' CHECK (payment_status IN ('paid', 'unpaid')),
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Admins Table Structure

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

## API Endpoints

### Admin Routes

All admin routes require authentication token in header:
```
Authorization: Bearer <token>
```

#### POST `/api/admin/login`
Login as admin

**Request:**
```json
{
  "email": "admin@siruvapuri.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "message": "Admin login successful",
  "token": "jwt_token_here",
  "admin": {
    "id": 1,
    "email": "admin@siruvapuri.com",
    "full_name": "Admin User"
  }
}
```

#### GET `/api/admin/users`
Get all registered users

**Response:**
```json
{
  "success": true,
  "users": [
    {
      "id": 1,
      "email": "john@example.com",
      "first_name": "John",
      "middle_name": "Kumar",
      "last_name": "Doe",
      "phone": "9876543210",
      "age": 28,
      "gender": "male",
      "payment_status": "paid",
      "is_approved": true,
      "has_password": true,
      "created_at": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

#### GET `/api/admin/users/paid-no-password`
Get paid users without passwords (for dropdown)

**Response:**
```json
{
  "success": true,
  "users": [
    {
      "id": 2,
      "email": "jane@example.com",
      "first_name": "Jane",
      "middle_name": null,
      "last_name": "Smith",
      "phone": "9876543211"
    }
  ]
}
```

#### PATCH `/api/admin/users/:userId/payment`
Update payment status

**Request:**
```json
{
  "payment_status": "paid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment status updated to paid"
}
```

#### POST `/api/admin/users/:userId/set-password`
Set password for paid user

**Request:**
```json
{
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password set successfully and user approved"
}
```

## Security Considerations

1. **Password Hashing**
   - All passwords (admin and user) are hashed using bcrypt
   - Minimum 10 salt rounds

2. **JWT Authentication**
   - Admin token expires in 7 days
   - Token includes `isAdmin: true` flag

3. **Authorization Checks**
   - All admin routes verify JWT token
   - Regular users cannot access admin endpoints

4. **Database Constraints**
   - Email uniqueness enforced
   - Gender values constrained
   - Payment status values constrained

## Troubleshooting

### Cannot Access Admin Panel

**Problem:** Admin login page not loading

**Solution:**
- Ensure frontend is running: `cd client && npm run dev`
- Access: http://localhost:5173/admin/login

### Invalid Admin Credentials

**Problem:** Login fails with "Invalid admin credentials"

**Solution:**
- Ensure admin account is created: `node scripts/createAdmin.js`
- Check database: `SELECT * FROM admins;`
- Verify email and password

### User Not in Dropdown

**Problem:** Paid user doesn't appear in password creation dropdown

**Solution:**
- Verify user payment status is `paid`
- Verify user doesn't already have a password
- Refresh the page

### User Cannot Login After Password Set

**Problem:** User sees "Invalid credentials" after admin set password

**Solution:**
- Verify all three conditions:
  1. Password is set: `SELECT password FROM users WHERE id = ?;`
  2. User is approved: `SELECT is_approved FROM users WHERE id = ?;`
  3. Payment is paid: `SELECT payment_status FROM users WHERE id = ?;`

## Future Enhancements

1. **Email Notifications**
   - Send email when user is approved
   - Include temporary password
   - Password reset functionality

2. **Payment Integration**
   - Integrate payment gateway
   - Automatic payment status update
   - Payment receipts

3. **Advanced Admin Features**
   - User analytics dashboard
   - Activity logs
   - Bulk operations
   - Export user data

4. **Multi-Admin Support**
   - Create multiple admin accounts
   - Role-based permissions
   - Admin activity tracking

## Support

For issues or questions:
1. Check this documentation
2. Review the SETUP_GUIDE.md
3. Check the MIGRATION_GUIDE.md
4. Review server logs for errors

---

**Last Updated:** 2025-12-29
