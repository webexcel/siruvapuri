# Admin Panel Documentation

## Overview

The Siruvapuri Matrimony Admin Panel is a comprehensive management system for administrators to manage users, matches, and monitor platform statistics.

## Features

### 1. Dashboard
- **Statistics Overview**: Real-time platform statistics
  - Total Users
  - Approved Users
  - Paid Users
  - Pending Approvals
  - Total Matches
  - Recent Registrations (Last 7 days)
  - Male/Female User Distribution
- **Recent Registrations Table**: View the latest 10 user registrations

### 2. User List
- **User Management**:
  - View all registered users in a table
  - Search users by name, email, or phone
  - Filter by approval status (All, Approved, Pending)
  - Filter by payment status (All, Paid, Unpaid)

- **Actions**:
  - Toggle payment status (Paid/Unpaid)
  - Toggle approval status (Approved/Pending)
  - Set password for users without one
  - Delete users (with cascade deletion of related data)

### 3. Create User
- **User Creation Form**:
  - Personal Information: First Name, Middle Name, Last Name, Age, Gender
  - Contact Information: Email, Phone
  - Account Settings: Password, Payment Status, Approval Status

- **Validation**:
  - All required fields enforced
  - Email uniqueness check
  - Phone number format validation (10 digits)
  - Password minimum length (6 characters)
  - Age range validation (18-100)

### 4. Matches
- **Match Overview**:
  - View all matches in the system
  - Statistics cards showing:
    - Total Matches
    - Accepted Matches
    - Pending Matches
    - High Score Matches (80+)

- **Features**:
  - Search matches by user names or emails
  - Filter by match status (All, Pending, Accepted, Rejected, Active)
  - View match scores with color-coded indicators
  - Delete matches

- **Match Score Colors**:
  - Green: 80-100% (Excellent match)
  - Blue: 60-79% (Good match)
  - Yellow: 40-59% (Fair match)
  - Red: 0-39% (Poor match)

### 5. Assign Match
- **Manual Matching**:
  - Select two approved and paid users
  - Set custom match score (0-100%)
  - Create matches manually

- **Features**:
  - Search and filter approved users
  - Gender-based filtering
  - Visual user cards with profile information
  - Duplicate match prevention
  - Self-match prevention

## Navigation

### Sidebar Menu Items:
1. Dashboard - `/admin/dashboard`
2. User List - `/admin/users`
3. Create User - `/admin/create-user`
4. Matches - `/admin/matches`
5. Assign Match - `/admin/assign-match`

## API Endpoints

### Authentication
- `POST /api/admin/login` - Admin login

### Dashboard
- `GET /api/admin/dashboard` - Get dashboard statistics and recent users

### User Management
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/paid-no-password` - Get paid users without passwords
- `GET /api/admin/users/approved` - Get approved users for matching
- `POST /api/admin/users/create` - Create new user
- `PATCH /api/admin/users/:userId/payment` - Update payment status
- `PATCH /api/admin/users/:userId/approval` - Update approval status
- `POST /api/admin/users/:userId/set-password` - Set user password
- `DELETE /api/admin/users/:userId` - Delete user

### Match Management
- `GET /api/admin/matches` - Get all matches
- `POST /api/admin/matches/create` - Create new match
- `DELETE /api/admin/matches/:matchId` - Delete match

## User Workflow

### Normal User Registration Flow:
1. User registers without password
2. Admin marks user as "Paid"
3. Admin sets password for user
4. User is automatically approved
5. User can now login

### Admin-Created User Flow:
1. Admin creates user with password
2. Admin sets payment and approval status
3. User can login immediately if approved and paid

## Security Features

- JWT-based authentication
- Protected admin routes
- Password hashing with bcrypt
- Admin middleware verification
- Cascade deletion for user data integrity

## Components

### Frontend Components:
1. `AdminLayout.jsx` - Main layout with sidebar navigation
2. `AdminLogin.jsx` - Admin login page
3. `AdminDashboard.jsx` - Dashboard with statistics
4. `AdminUserList.jsx` - User management page
5. `AdminCreateUser.jsx` - User creation form
6. `AdminMatches.jsx` - Match listing page
7. `AdminAssignMatch.jsx` - Manual match creation

### Backend Components:
1. `adminController.js` - All admin API handlers
2. `admin.js` (routes) - Admin route definitions
3. `auth.js` (middleware) - JWT authentication

## Default Admin Credentials

**Email**: admin@siruvapuri.com
**Password**: admin123

⚠️ **Important**: Change the default admin password after first login in a production environment.

## Database Tables Used

- `admins` - Admin user accounts
- `users` - Regular user accounts
- `matches` - User matches
- `interests` - User interests/likes
- `profile_views` - Profile view tracking
- `profiles` - Detailed user profiles
- `preferences` - User preferences

## UI/UX Features

### Color Scheme:
- Primary: #00D26A (Green)
- Primary Dark: #00B85A
- Primary Light: #33DD89

### Icons:
- Lucide React icons throughout
- Consistent iconography
- Color-coded status indicators

### Responsive Design:
- Mobile-friendly sidebar
- Responsive tables
- Grid-based layouts
- Touch-friendly buttons

## Best Practices

### For Admins:
1. Always verify payment before setting passwords
2. Review user information before approval
3. Use search and filters for efficient management
4. Create matches with appropriate scores
5. Regularly monitor dashboard statistics

### For Developers:
1. Always use the admin middleware for protected routes
2. Validate all input data
3. Handle errors gracefully
4. Provide clear feedback messages
5. Maintain consistent UI patterns

## Troubleshooting

### Admin Can't Login:
- Verify admin account exists in database
- Check email and password
- Ensure JWT_SECRET is set in .env
- Check browser console for errors

### Statistics Not Loading:
- Verify database connection
- Check if tables have data
- Review server console for errors

### User Deletion Fails:
- Check for foreign key constraints
- Ensure cascade deletion is working
- Review server logs

### Match Creation Fails:
- Verify both users are approved and paid
- Check for duplicate matches
- Ensure users are not the same

## Future Enhancements

Potential features for future versions:
- Bulk user import/export
- Advanced analytics and reports
- Email notifications to users
- Payment integration
- Profile verification system
- Chat/messaging system
- Activity logs and audit trail
- Role-based admin permissions
- Automated match suggestions
- User feedback and ratings

## Support

For issues or questions:
- Check server and browser console logs
- Review API responses in Network tab
- Verify database connections
- Check environment variables
- Review this documentation

---

**Version**: 1.0.0
**Last Updated**: 2025-12-29
**Built with**: React, Node.js, Express, PostgreSQL
