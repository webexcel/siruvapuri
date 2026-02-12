# API Documentation - MatriMatch

Base URL: `http://localhost:5000/api`

## Authentication Endpoints

### Register User
**POST** `/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "phone": "9876543210",
  "gender": "male",
  "date_of_birth": "1995-05-15"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe",
    "gender": "male"
  }
}
```

### Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe",
    "gender": "male"
  }
}
```

### Get Current User
**GET** `/auth/me`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe",
    "gender": "male",
    "height": 175,
    "education": "B.Tech",
    "occupation": "Software Engineer",
    "city": "Mumbai",
    "profile_picture": "url",
    "about_me": "..."
  }
}
```

## Profile Endpoints

### Update Profile
**PUT** `/profile/update`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "height": 175,
  "weight": 70,
  "marital_status": "never_married",
  "religion": "Hindu",
  "education": "B.Tech",
  "occupation": "Software Engineer",
  "annual_income": "10-15 LPA",
  "city": "Mumbai",
  "state": "Maharashtra",
  "about_me": "About myself...",
  "looking_for": "Looking for...",
  "hobbies": "Reading, Traveling"
}
```

**Response:**
```json
{
  "message": "Profile updated successfully"
}
```

### Get Profile by ID
**GET** `/profile/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "profile": {
    "id": 2,
    "full_name": "Priya Sharma",
    "gender": "female",
    "age": 27,
    "height": 165,
    "education": "MBA",
    "occupation": "Business Analyst",
    "city": "Delhi",
    "religion": "Hindu",
    "about_me": "...",
    "profile_picture": "url"
  }
}
```

### Update Preferences
**PUT** `/profile/preferences`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "age_min": 25,
  "age_max": 35,
  "height_min": 160,
  "height_max": 180,
  "marital_status": "never_married",
  "religion": "Hindu",
  "education": "Graduate",
  "location": "Mumbai"
}
```

**Response:**
```json
{
  "message": "Preferences updated successfully"
}
```

### Get Preferences
**GET** `/profile/preferences/get`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "preferences": {
    "age_min": 25,
    "age_max": 35,
    "height_min": 160,
    "height_max": 180,
    "religion": "Hindu"
  }
}
```

## Match Endpoints

### Get Daily Recommendations
**GET** `/match/recommendations?limit=10`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` (optional): Number of recommendations (default: 10)

**Response:**
```json
{
  "recommendations": [
    {
      "id": 2,
      "full_name": "Priya Sharma",
      "age": 27,
      "height": 165,
      "education": "MBA",
      "occupation": "Business Analyst",
      "city": "Delhi",
      "profile_picture": "url",
      "match_score": 85
    }
  ],
  "total": 10
}
```

### Search Profiles
**GET** `/match/search`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `age_min`: Minimum age
- `age_max`: Maximum age
- `height_min`: Minimum height in cm
- `height_max`: Maximum height in cm
- `religion`: Religion filter
- `education`: Education filter
- `city`: City filter
- `marital_status`: Marital status filter
- `limit`: Results per page (default: 20)
- `offset`: Pagination offset (default: 0)

**Example:**
```
/match/search?age_min=25&age_max=30&city=Mumbai&limit=20
```

**Response:**
```json
{
  "profiles": [
    {
      "id": 3,
      "full_name": "Anjali Patel",
      "age": 28,
      "height": 162,
      "education": "B.Com",
      "occupation": "Teacher",
      "city": "Mumbai"
    }
  ],
  "total": 5,
  "limit": 20,
  "offset": 0
}
```

### Send Interest
**POST** `/match/interest/send`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "receiver_id": 2,
  "message": "Hi, I would like to connect with you"
}
```

**Response:**
```json
{
  "message": "Interest sent successfully"
}
```

### Get Received Interests
**GET** `/match/interest/received`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "interests": [
    {
      "id": 1,
      "sender_id": 3,
      "full_name": "Rahul Kumar",
      "age": 29,
      "city": "Bangalore",
      "education": "B.Tech",
      "occupation": "Software Engineer",
      "profile_picture": "url",
      "status": "sent",
      "message": "Hi, I would like to connect",
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### Get Sent Interests
**GET** `/match/interest/sent`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "interests": [
    {
      "id": 2,
      "receiver_id": 5,
      "full_name": "Neha Gupta",
      "age": 26,
      "city": "Chennai",
      "education": "MBBS",
      "occupation": "Doctor",
      "profile_picture": "url",
      "status": "accepted",
      "message": "Hi, interested in your profile",
      "created_at": "2024-01-14T15:20:00.000Z"
    }
  ]
}
```

### Respond to Interest
**PUT** `/match/interest/respond`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "interest_id": 1,
  "status": "accepted"
}
```

Status options: `accepted` or `rejected`

**Response:**
```json
{
  "message": "Interest accepted successfully"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid input data",
  "errors": [
    {
      "field": "email",
      "message": "Valid email is required"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Something went wrong!"
}
```

## Match Score Calculation

The match score is calculated based on:
- **Age Match (30%)**: How well the age fits the preference range
- **Height Match (20%)**: Height preference compatibility
- **Education Match (15%)**: Education level compatibility
- **Religion Match (15%)**: Same religion preference
- **Location Match (10%)**: Same city/nearby location
- **Marital Status (10%)**: Marital status preference

Score ranges:
- 80-100: Excellent Match
- 60-79: Good Match
- 40-59: Fair Match
- 0-39: Low Match

## Rate Limiting

Currently no rate limiting is implemented. In production, consider adding:
- Login attempts: 5 per 15 minutes
- API requests: 100 per minute per user
- Interest sending: 20 per day

## Testing with Postman/Thunder Client

1. Register/Login to get JWT token
2. Add token to Authorization header: `Bearer <your_token>`
3. Test all protected endpoints

## Frontend Integration Example

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Get recommendations
const getRecommendations = async () => {
  const response = await api.get('/match/recommendations?limit=10');
  return response.data;
};
```

---

For more information, check the main README.md file.
