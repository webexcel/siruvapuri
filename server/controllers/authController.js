const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Register new user
const register = async (req, res) => {
  try {
    const { email, password, full_name, phone, gender, date_of_birth } = req.body;

    // Check if user already exists
    const existingUsers = await db.query('SELECT id FROM users WHERE email = $1', [email]);

    if (existingUsers.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const result = await db.query(
      'INSERT INTO users (email, password, full_name, phone, gender, date_of_birth) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [email, hashedPassword, full_name, phone || null, gender, date_of_birth || null]
    );

    const userId = result.rows[0].id;

    // Create empty profile and preferences
    await db.query('INSERT INTO profiles (user_id) VALUES ($1)', [userId]);
    await db.query('INSERT INTO preferences (user_id) VALUES ($1)', [userId]);

    // Generate token
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: userId,
        email,
        full_name,
        gender
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const users = await db.query('SELECT * FROM users WHERE email = $1', [email]);

    if (users.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        gender: user.gender
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    const users = await db.query(
      `SELECT u.id, u.email, u.full_name, u.phone, u.gender, u.date_of_birth, u.created_at,
              p.height, p.weight, p.marital_status, p.religion, p.caste, p.mother_tongue,
              p.education, p.occupation, p.annual_income, p.city, p.state, p.country,
              p.about_me, p.profile_picture, p.looking_for, p.hobbies, p.created_by
       FROM users u
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE u.id = $1`,
      [req.userId]
    );

    if (users.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: users.rows[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser
};
