# MatriMatch - Matrimonial Web Application

A modern, full-stack matrimonial web application built with React, Node.js, Express, and PostgreSQL. Find your perfect life partner with our intelligent matching system!

## Features

### User Features
- **User Authentication**: Secure registration and login system with JWT tokens
- **Profile Management**: Create and update detailed profiles with personal, educational, and professional information
- **Smart Matching Algorithm**: Get personalized match recommendations based on preferences
- **Advanced Search**: Filter profiles by age, height, education, religion, location, and more
- **Interest Management**: Send and receive interests, accept or decline proposals
- **Profile Views**: Track who viewed your profile
- **Daily Recommendations**: Get curated profile suggestions daily

### Technical Features
- Responsive design with TailwindCSS v4 (CSS-based configuration)
- RESTful API architecture
- PostgreSQL database with optimized indexes
- JWT-based authentication
- Protected routes and middleware
- Input validation
- Modern UI with card-based layouts
- Real-time match score calculation

## Tech Stack

### Frontend
- **React** (v19.2.0) - UI library
- **Vite** (v7.2.4) - Build tool and dev server
- **TailwindCSS** (v4.1.18) - Utility-first CSS framework with CSS-based configuration (no JS config needed)
- **React Router DOM** (v7.11.0) - Client-side routing
- **Axios** (v1.13.2) - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express** (v4.18.2) - Web framework
- **PostgreSQL** (v8.11.3 pg driver) - Relational database
- **bcryptjs** (v2.4.3) - Password hashing
- **jsonwebtoken** (v9.0.2) - JWT authentication
- **express-validator** (v7.0.1) - Input validation
- **cors** (v2.8.5) - CORS middleware
- **dotenv** (v16.3.1) - Environment variables

## Project Structure

```
siruvapuri_new/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── ProfileCard.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/       # React context
│   │   │   └── AuthContext.jsx
│   │   ├── pages/         # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Recommendations.jsx
│   │   │   ├── Search.jsx
│   │   │   ├── ProfileView.jsx
│   │   │   └── Interests.jsx
│   │   ├── utils/         # Utilities
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
│
├── server/                # Node.js backend
│   ├── config/
│   │   ├── database.js   # PostgreSQL connection
│   │   └── schema.sql    # Database schema
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── profileController.js
│   │   └── matchController.js
│   ├── middleware/
│   │   ├── auth.js       # JWT authentication
│   │   └── validation.js # Input validation
│   ├── routes/
│   │   ├── auth.js
│   │   ├── profile.js
│   │   └── match.js
│   ├── seed.js           # Database seeding script
│   ├── server.js         # Main server file
│   ├── package.json
│   └── .env              # Environment variables
│
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd siruvapuri_new
```

### 2. Database Setup

1. Start your PostgreSQL server
2. Create the database:

```bash
# Using psql command line
psql -U postgres
CREATE DATABASE matrimonial_db;
\c matrimonial_db
\i server/config/schema.sql
\q
```

Or using a single command:
```bash
psql -U postgres -d postgres -c "CREATE DATABASE matrimonial_db;"
psql -U postgres -d matrimonial_db -f server/config/schema.sql
```

### 3. Backend Setup

```bash
cd server
npm install
```

Configure environment variables by editing `server/.env`:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=matrimonial_db
JWT_SECRET=your_secret_key
NODE_ENV=development
```

Seed the database with sample data:
```bash
node seed.js
```

Start the backend server:
```bash
npm start
# or for development with auto-reload
npm run dev
```

The API will be running at `http://localhost:5000`

### 4. Frontend Setup

```bash
cd client
npm install
```

Start the development server:
```bash
npm run dev
```

The frontend will be running at `http://localhost:5173`

## Usage

### Test Credentials

After seeding the database, you can use these credentials to login:

**Male Account:**
- Email: `john.doe@example.com`
- Password: `password123`

**Female Account:**
- Email: `priya.sharma@example.com`
- Password: `password123`

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

#### Profile
- `PUT /api/profile/update` - Update profile (protected)
- `GET /api/profile/:id` - Get profile by ID (protected)
- `PUT /api/profile/preferences` - Update preferences (protected)
- `GET /api/profile/preferences/get` - Get preferences (protected)

#### Matching
- `GET /api/match/recommendations` - Get daily recommendations (protected)
- `GET /api/match/search` - Search profiles (protected)
- `POST /api/match/interest/send` - Send interest (protected)
- `GET /api/match/interest/received` - Get received interests (protected)
- `GET /api/match/interest/sent` - Get sent interests (protected)
- `PUT /api/match/interest/respond` - Respond to interest (protected)

## Database Schema

### Tables
1. **users** - User authentication and basic info
2. **profiles** - Detailed user profiles
3. **preferences** - User matching preferences
4. **matches** - Match records with scores
5. **interests** - Interest/like management
6. **profile_views** - Profile visit tracking

## Features in Detail

### Match Score Algorithm
The system calculates match scores based on:
- Age compatibility (30 points)
- Height preference (20 points)
- Education match (15 points)
- Religion match (15 points)
- Location preference (10 points)
- Marital status (10 points)

### Security Features
- Password hashing with bcrypt
- JWT token authentication
- Protected API routes
- Input validation and sanitization
- CORS configuration
- XSS and SQL injection prevention

## Color Scheme

- Primary: `#00D26A` (Green)
- Primary Dark: `#00B85A`
- Primary Light: `#33DD89`

## Development

### Build for Production

**Backend:**
```bash
cd server
npm start
```

**Frontend:**
```bash
cd client
npm run build
```

The built files will be in `client/dist/`

### Linting
```bash
cd client
npm run lint
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Troubleshooting

### Database Connection Issues
- Ensure MySQL is running
- Verify credentials in `.env` file
- Check if database `matrimonial_db` exists

### Port Already in Use
- Change PORT in `server/.env` for backend
- Frontend port can be changed in `vite.config.js`

### CORS Errors
- Verify API_BASE_URL in `client/src/utils/api.js`
- Check CORS configuration in `server/server.js`

## License

This project is licensed under the MIT License.

## Support

For support, email support@matrimatch.com or create an issue in the repository.

## Acknowledgments

- React team for the amazing library
- TailwindCSS for the utility-first CSS framework
- Express.js for the robust backend framework
- MySQL for reliable data storage

---

**Happy Matchmaking! 💚**
