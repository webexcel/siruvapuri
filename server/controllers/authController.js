const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../config/database');

// In-memory OTP storage (in production, use Redis or database)
const otpStore = new Map();

// Register new user (without password, admin will set it)
const register = async (req, res) => {
  try {
    const { first_name, middle_name, last_name, phone, age, gender, interested_membership } = req.body;

    // Check if phone number already exists
    const existingPhone = await db.query('SELECT id FROM users WHERE phone = ?', [phone]);

    if (existingPhone.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Phone number already registered' });
    }

    // Insert user without password (admin will set it later)
    const result = await db.query(
      `INSERT INTO users (first_name, middle_name, last_name, phone, age, gender, interested_membership, payment_status, is_approved)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'unpaid', false)`,
      [first_name, middle_name || null, last_name, phone, age || null, gender || null, interested_membership || null]
    );

    const userId = result.rows.insertId;

    // Create empty profile and preferences
    await db.query('INSERT INTO profiles (user_id) VALUES (?)', [userId]);
    await db.query('INSERT INTO preferences (user_id) VALUES (?)', [userId]);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Admin will review and set your password.',
      user: { id: userId, first_name, middle_name, last_name }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { login_id, password } = req.body;

    // Find user by phone number
    const users = await db.query('SELECT * FROM users WHERE phone = ?', [login_id]);

    if (users.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users.rows[0];

    // Check if password is set
    if (!user.password) {
      return res.status(401).json({ error: 'Account pending admin approval. Password not yet set.' });
    }

    // Check if approved
    if (!user.is_approved) {
      return res.status(401).json({ error: 'Account is not approved yet. Please wait for admin approval.' });
    }

    // Check if payment is made
    if (user.payment_status !== 'paid') {
      return res.status(401).json({ error: 'Payment pending. Please contact admin.' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    const full_name = `${user.first_name}${user.middle_name ? ' ' + user.middle_name : ''} ${user.last_name}`;

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        full_name: full_name,
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
      `SELECT u.id,
              CONCAT(u.first_name, COALESCE(CONCAT(' ', u.middle_name), ''), ' ', u.last_name) as full_name,
              u.first_name, u.middle_name, u.last_name,
              u.phone, u.gender, u.age, u.created_at,
              u.membership_type, u.membership_expiry,
              CASE
                WHEN u.membership_expiry IS NOT NULL AND u.membership_expiry > NOW() THEN true
                ELSE false
              END as is_membership_active,
              p.date_of_birth, p.birth_place,
              p.height, p.weight, p.complexion, p.blood_group, p.physical_status,
              p.marital_status, p.religion, p.caste, p.sub_caste, p.mother_tongue,
              p.education, p.education_detail, p.occupation, p.company_name, p.working_place,
              p.annual_income, p.monthly_income,
              p.time_of_birth, p.rasi, p.nakshatra, p.lagnam, p.kothram, p.dosham, p.matching_stars,
              p.father_name, p.father_occupation, p.father_status,
              p.mother_name, p.mother_occupation, p.mother_status,
              p.brothers_count, p.brothers_married, p.sisters_count, p.sisters_married,
              p.family_type, p.family_status, p.own_house, p.native_place,
              p.address, p.city, p.state, p.country, p.pincode,
              p.expected_age_min, p.expected_age_max, p.expected_qualification,
              p.expected_location, p.expected_income,
              p.about_me, p.profile_picture, p.looking_for, p.hobbies, p.created_by
       FROM users u
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE u.id = ?`,
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

// Generate OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Request password reset OTP
const requestPasswordReset = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    // Find user by phone
    const users = await db.query(
      `SELECT id, first_name, last_name, is_approved, payment_status
       FROM users WHERE phone = ?`,
      [phone]
    );

    if (users.rows.length === 0) {
      return res.status(404).json({ error: 'No account found with this phone number' });
    }

    const user = users.rows[0];

    // Check if user is approved and has paid
    if (!user.is_approved || user.payment_status !== 'paid') {
      return res.status(403).json({
        error: 'Your account is not yet active. Please contact admin for approval.'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP
    otpStore.set(phone, {
      otp,
      expiresAt,
      userId: user.id,
      attempts: 0
    });

    // TODO: Send OTP via SMS in production
    console.log('Password reset OTP for phone ' + phone + ': ' + otp);

    res.json({
      success: true,
      message: 'OTP sent to your phone number'
    });
  } catch (error) {
    console.error('Request password reset error:', error);
    res.status(500).json({ error: 'Failed to send password reset OTP' });
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone number and OTP are required' });
    }

    const storedData = otpStore.get(phone);

    if (!storedData) {
      return res.status(400).json({ error: 'No OTP request found. Please request a new OTP.' });
    }

    // Check expiry
    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(phone);
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    // Check attempts
    if (storedData.attempts >= 3) {
      otpStore.delete(phone);
      return res.status(400).json({ error: 'Too many incorrect attempts. Please request a new OTP.' });
    }

    // Verify OTP
    if (storedData.otp !== otp) {
      storedData.attempts += 1;
      return res.status(400).json({ error: 'Invalid OTP. Please try again.' });
    }

    // OTP verified - generate a reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    storedData.resetToken = resetToken;
    storedData.resetTokenExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes to reset password

    res.json({
      success: true,
      message: 'OTP verified successfully',
      resetToken
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { phone, resetToken, newPassword } = req.body;

    if (!phone || !resetToken || !newPassword) {
      return res.status(400).json({ error: 'Phone number, reset token, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const storedData = otpStore.get(phone);

    if (!storedData || !storedData.resetToken) {
      return res.status(400).json({ error: 'Invalid reset session. Please start over.' });
    }

    // Verify reset token
    if (storedData.resetToken !== resetToken) {
      return res.status(400).json({ error: 'Invalid reset token' });
    }

    // Check token expiry
    if (Date.now() > storedData.resetTokenExpiry) {
      otpStore.delete(phone);
      return res.status(400).json({ error: 'Reset session expired. Please start over.' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in database
    await db.query(
      'UPDATE users SET password = ?, plain_password = ? WHERE id = ?',
      [hashedPassword, newPassword, storedData.userId]
    );

    // Clear OTP data
    otpStore.delete(phone);

    res.json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  requestPasswordReset,
  verifyOTP,
  resetPassword
};
