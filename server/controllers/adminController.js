const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const emailService = require('../utils/emailService');

// Admin login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin
    const admins = await db.query('SELECT * FROM admins WHERE email = $1', [email]);

    if (admins.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const admin = admins.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { adminId: admin.id, isAdmin: true },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Admin login successful',
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        full_name: admin.full_name
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Admin login failed' });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await db.query(`
      SELECT
        u.id, u.email, u.first_name, u.middle_name, u.last_name, u.phone, u.age, u.gender,
        u.payment_status, u.membership_type, u.membership_expiry,
        u.is_approved, u.password IS NOT NULL as has_password, u.created_at,
        p.profile_picture,
        CASE
          WHEN u.membership_expiry IS NOT NULL AND u.membership_expiry > NOW() THEN true
          ELSE false
        END as is_membership_active
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      ORDER BY u.created_at DESC
    `);

    res.json({
      success: true,
      users: users.rows
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Update payment status
const updatePaymentStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { payment_status } = req.body;

    // Get user details before update
    const userResult = await db.query(
      'SELECT email, first_name, last_name FROM users WHERE id = $1',
      [userId]
    );

    const user = userResult.rows[0];

    await db.query(
      'UPDATE users SET payment_status = $1 WHERE id = $2',
      [payment_status, userId]
    );

    // Send email if payment confirmed
    if (payment_status === 'paid') {
      const fullName = `${user.first_name} ${user.last_name}`;
      await emailService.sendPaymentConfirmedEmail(user.email, fullName);
    }

    res.json({
      success: true,
      message: `Payment status updated to ${payment_status}`
    });
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({ error: 'Failed to update payment status' });
  }
};

// Set password for approved paid user
const setUserPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { password } = req.body;

    // Check if user is paid and get user details
    const userCheck = await db.query(
      'SELECT email, first_name, last_name, payment_status FROM users WHERE id = $1',
      [userId]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userCheck.rows[0];

    if (user.payment_status !== 'paid') {
      return res.status(400).json({ error: 'User must be marked as paid before setting password' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password, plain_password, and approve user
    await db.query(
      'UPDATE users SET password = $1, plain_password = $2, is_approved = true WHERE id = $3',
      [hashedPassword, password, userId]
    );

    // Send email with credentials
    const fullName = `${user.first_name} ${user.last_name}`;
    await emailService.sendPasswordSetEmail(user.email, fullName, password);

    res.json({
      success: true,
      message: 'Password set successfully and user approved'
    });
  } catch (error) {
    console.error('Set password error:', error);
    res.status(500).json({ error: 'Failed to set password' });
  }
};

// Get paid users without password (for password creation dropdown)
const getPaidUsersWithoutPassword = async (req, res) => {
  try {
    const users = await db.query(`
      SELECT id, email, first_name, middle_name, last_name, phone
      FROM users
      WHERE payment_status = 'paid' AND password IS NULL
      ORDER BY first_name, last_name
    `);

    res.json({
      success: true,
      users: users.rows
    });
  } catch (error) {
    console.error('Get paid users error:', error);
    res.status(500).json({ error: 'Failed to fetch paid users' });
  }
};

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    // Get total users
    const totalUsersResult = await db.query('SELECT COUNT(*) as count FROM users');
    const totalUsers = parseInt(totalUsersResult.rows[0].count);

    // Get approved users
    const approvedUsersResult = await db.query('SELECT COUNT(*) as count FROM users WHERE is_approved = true');
    const approvedUsers = parseInt(approvedUsersResult.rows[0].count);

    // Get paid users
    const paidUsersResult = await db.query("SELECT COUNT(*) as count FROM users WHERE payment_status = 'paid'");
    const paidUsers = parseInt(paidUsersResult.rows[0].count);

    // Get pending users
    const pendingUsers = totalUsers - approvedUsers;

    // Get total matches
    const totalMatchesResult = await db.query('SELECT COUNT(*) as count FROM matches');
    const totalMatches = parseInt(totalMatchesResult.rows[0].count);

    // Get recent registrations (last 7 days)
    const recentResult = await db.query(
      "SELECT COUNT(*) as count FROM users WHERE created_at >= NOW() - INTERVAL '7 days'"
    );
    const recentRegistrations = parseInt(recentResult.rows[0].count);

    // Get male and female users
    const maleUsersResult = await db.query("SELECT COUNT(*) as count FROM users WHERE gender = 'male'");
    const maleUsers = parseInt(maleUsersResult.rows[0].count);

    const femaleUsersResult = await db.query("SELECT COUNT(*) as count FROM users WHERE gender = 'female'");
    const femaleUsers = parseInt(femaleUsersResult.rows[0].count);

    // Get recent users (last 10)
    const recentUsers = await db.query(`
      SELECT
        u.id, u.email, u.first_name, u.middle_name, u.last_name, u.phone, u.age, u.gender,
        u.payment_status, u.is_approved, u.created_at,
        p.profile_picture
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      ORDER BY u.created_at DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      stats: {
        totalUsers,
        approvedUsers,
        paidUsers,
        pendingUsers,
        totalMatches,
        recentRegistrations,
        maleUsers,
        femaleUsers
      },
      recentUsers: recentUsers.rows
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
};

// Update approval status
const updateApprovalStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { is_approved } = req.body;

    // Get user details before update
    const userResult = await db.query(
      'SELECT email, first_name, last_name FROM users WHERE id = $1',
      [userId]
    );

    const user = userResult.rows[0];

    await db.query(
      'UPDATE users SET is_approved = $1 WHERE id = $2',
      [is_approved, userId]
    );

    // Send email if approved
    if (is_approved) {
      const fullName = `${user.first_name} ${user.last_name}`;
      await emailService.sendAccountApprovedEmail(user.email, fullName);
    }

    res.json({
      success: true,
      message: `User ${is_approved ? 'approved' : 'approval revoked'}`
    });
  } catch (error) {
    console.error('Update approval error:', error);
    res.status(500).json({ error: 'Failed to update approval status' });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  const client = await db.connect();

  try {
    const { userId } = req.params;

    await client.query("BEGIN");

    // 🔴 FIXED: matches table column
    await client.query(
      "DELETE FROM matches WHERE user_id = $1",
      [userId]
    );

    await client.query(
      "DELETE FROM interests WHERE sender_id = $1 OR receiver_id = $1",
      [userId]
    );

    await client.query(
      "DELETE FROM profile_views WHERE viewer_id = $1 OR viewed_id = $1",
      [userId]
    );

    await client.query(
      "DELETE FROM profiles WHERE user_id = $1",
      [userId]
    );

    await client.query(
      "DELETE FROM preferences WHERE user_id = $1",
      [userId]
    );

    await client.query(
      "DELETE FROM users WHERE id = $1",
      [userId]
    );

    await client.query("COMMIT");

    res.json({
      success: true,
      message: "User deleted successfully"
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Delete user error:", error);
    res.status(500).json({ error: "Failed to delete user" });
  } finally {
    client.release();
  }
};

// Create user by admin
const createUser = async (req, res) => {
  try {
    const {
      email,
      first_name,
      middle_name,
      last_name,
      phone,
      age,
      gender,
      password,
      payment_status,
      is_approved
    } = req.body;

    // Check if email already exists
    const existingUser = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const result = await db.query(
      `INSERT INTO users (email, password, first_name, middle_name, last_name, phone, age, gender, payment_status, is_approved)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, email, first_name, last_name`,
      [email, hashedPassword, first_name, middle_name, last_name, phone, age, gender, payment_status, is_approved]
    );

    res.json({
      success: true,
      message: 'User created successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

// Get all matches
const getAllMatches = async (req, res) => {
  try {
    const matches = await db.query(`
      SELECT
        m.id,
        m.match_score,
        m.status,
        m.created_at,
        u1.first_name || ' ' || COALESCE(u1.middle_name || ' ', '') || u1.last_name as user1_name,
        u1.email as user1_email,
        p1.profile_picture as user1_picture,
        u2.first_name || ' ' || COALESCE(u2.middle_name || ' ', '') || u2.last_name as user2_name,
        u2.email as user2_email,
        p2.profile_picture as user2_picture
      FROM matches m
      JOIN users u1 ON m.user_id = u1.id
      JOIN users u2 ON m.matched_user_id = u2.id
      LEFT JOIN profiles p1 ON u1.id = p1.user_id
      LEFT JOIN profiles p2 ON u2.id = p2.user_id
      ORDER BY m.created_at DESC
    `);

    res.json({
      success: true,
      matches: matches.rows
    });
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
};

// Delete match
const deleteMatch = async (req, res) => {
  try {
    const { matchId } = req.params;

    await db.query('DELETE FROM matches WHERE id = $1', [matchId]);

    res.json({
      success: true,
      message: 'Match deleted successfully'
    });
  } catch (error) {
    console.error('Delete match error:', error);
    res.status(500).json({ error: 'Failed to delete match' });
  }
};

// Get approved users for matching
const getApprovedUsers = async (req, res) => {
  try {
    const users = await db.query(`
      SELECT
        u.id, u.email, u.first_name, u.middle_name, u.last_name, u.phone, u.age, u.gender,
        p.height, p.weight, p.marital_status, p.religion, p.caste, p.mother_tongue,
        p.education, p.occupation, p.annual_income, p.city, p.state, p.country,
        p.about_me, p.looking_for, p.hobbies, p.profile_picture
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE u.is_approved = true AND u.payment_status = 'paid'
      ORDER BY u.first_name, u.last_name
    `);

    res.json({
      success: true,
      users: users.rows
    });
  } catch (error) {
    console.error('Get approved users error:', error);
    res.status(500).json({ error: 'Failed to fetch approved users' });
  }
};

// Create match manually
const createMatch = async (req, res) => {
  try {
    const { user1_id, user2_id, match_score } = req.body;

    if (user1_id === user2_id) {
      return res.status(400).json({ error: 'Cannot match a user with themselves' });
    }

    // Check if match already exists
    const existingMatch = await db.query(
      `SELECT id FROM matches
       WHERE (user_id = $1 AND matched_user_id = $2) OR (user_id = $2 AND matched_user_id = $1)`,
      [user1_id, user2_id]
    );

    if (existingMatch.rows.length > 0) {
      return res.status(400).json({ error: 'Match already exists between these users' });
    }

    // Create match
    await db.query(
      `INSERT INTO matches (user_id, matched_user_id, match_score, status)
       VALUES ($1, $2, $3, 'pending')`,
      [user1_id, user2_id, match_score]
    );

    res.json({
      success: true,
      message: 'Match created successfully'
    });
  } catch (error) {
    console.error('Create match error:', error);
    res.status(500).json({ error: 'Failed to create match' });
  }
};

// Get all interests (who sent to whom)
const getAllInterests = async (req, res) => {
  try {
    const interests = await db.query(`
      SELECT
        i.id,
        i.status,
        i.created_at,
        i.updated_at,
        sender.id as sender_id,
        sender.first_name || ' ' || COALESCE(sender.middle_name || ' ', '') || sender.last_name as sender_name,
        sender.email as sender_email,
        sender.age as sender_age,
        sender.gender as sender_gender,
        sp.profile_picture as sender_picture,
        receiver.id as receiver_id,
        receiver.first_name || ' ' || COALESCE(receiver.middle_name || ' ', '') || receiver.last_name as receiver_name,
        receiver.email as receiver_email,
        receiver.age as receiver_age,
        receiver.gender as receiver_gender,
        rp.profile_picture as receiver_picture
      FROM interests i
      JOIN users sender ON i.sender_id = sender.id
      JOIN users receiver ON i.receiver_id = receiver.id
      LEFT JOIN profiles sp ON sender.id = sp.user_id
      LEFT JOIN profiles rp ON receiver.id = rp.user_id
      ORDER BY i.created_at DESC
    `);

    // Get statistics (using correct status values: sent, accepted, rejected)
    const statsResult = await db.query(`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'sent' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as declined
      FROM interests
    `);

    res.json({
      success: true,
      interests: interests.rows,
      stats: statsResult.rows[0]
    });
  } catch (error) {
    console.error('Get interests error:', error);
    res.status(500).json({ error: 'Failed to fetch interests' });
  }
};

// Get interest details by user
const getInterestsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get interests sent by user
    const sentInterests = await db.query(`
      SELECT
        i.id,
        i.status,
        i.created_at,
        i.updated_at,
        receiver.id as receiver_id,
        receiver.first_name || ' ' || COALESCE(receiver.middle_name || ' ', '') || receiver.last_name as receiver_name,
        receiver.email as receiver_email,
        receiver.age as receiver_age,
        receiver.gender as receiver_gender
      FROM interests i
      JOIN users receiver ON i.receiver_id = receiver.id
      WHERE i.sender_id = $1
      ORDER BY i.created_at DESC
    `, [userId]);

    // Get interests received by user
    const receivedInterests = await db.query(`
      SELECT
        i.id,
        i.status,
        i.created_at,
        i.updated_at,
        sender.id as sender_id,
        sender.first_name || ' ' || COALESCE(sender.middle_name || ' ', '') || sender.last_name as sender_name,
        sender.email as sender_email,
        sender.age as sender_age,
        sender.gender as sender_gender
      FROM interests i
      JOIN users sender ON i.sender_id = sender.id
      WHERE i.receiver_id = $1
      ORDER BY i.created_at DESC
    `, [userId]);

    res.json({
      success: true,
      sent: sentInterests.rows,
      received: receivedInterests.rows
    });
  } catch (error) {
    console.error('Get user interests error:', error);
    res.status(500).json({ error: 'Failed to fetch user interests' });
  }
};

// Update user profile data
const updateUserData = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      email,
      first_name,
      middle_name,
      last_name,
      phone,
      age,
      gender
    } = req.body;

    // Check if email already exists for another user
    if (email) {
      const existingUser = await db.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, userId]
      );
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }

    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (email) {
      updates.push(`email = $${paramCount++}`);
      values.push(email);
    }
    if (first_name) {
      updates.push(`first_name = $${paramCount++}`);
      values.push(first_name);
    }
    if (middle_name !== undefined) {
      updates.push(`middle_name = $${paramCount++}`);
      values.push(middle_name);
    }
    if (last_name) {
      updates.push(`last_name = $${paramCount++}`);
      values.push(last_name);
    }
    if (phone) {
      updates.push(`phone = $${paramCount++}`);
      values.push(phone);
    }
    if (age) {
      updates.push(`age = $${paramCount++}`);
      values.push(age);
    }
    if (gender) {
      updates.push(`gender = $${paramCount++}`);
      values.push(gender);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await db.query(query, values);

    res.json({
      success: true,
      message: 'User updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

// Get all users with passwords (for password management page)
const getUsersWithPasswords = async (req, res) => {
  try {
    const users = await db.query(`
      SELECT
        u.id, u.email, u.first_name, u.middle_name, u.last_name, u.phone, u.age, u.gender,
        u.payment_status, u.is_approved, u.password IS NOT NULL as has_password,
        u.plain_password, u.created_at,
        p.profile_picture
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE u.payment_status = 'paid' AND u.is_approved = true
      ORDER BY u.created_at DESC
    `);

    res.json({
      success: true,
      users: users.rows
    });
  } catch (error) {
    console.error('Get users with passwords error:', error);
    res.status(500).json({ error: 'Failed to fetch users with passwords' });
  }
};

// Assign membership to user
const assignMembership = async (req, res) => {
  try {
    const { userId } = req.params;
    const { membership_type } = req.body;

    // Validate membership type
    const validTypes = ['gold', 'platinum', 'premium'];
    if (!validTypes.includes(membership_type)) {
      return res.status(400).json({ error: 'Invalid membership type' });
    }

    // Get user details
    const userResult = await db.query(
      'SELECT email, first_name, last_name FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Calculate expiry based on membership type
    let months = 3; // gold
    if (membership_type === 'platinum') months = 6;
    if (membership_type === 'premium') months = 12;

    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + months);

    // Update user with membership
    await db.query(
      `UPDATE users SET
        payment_status = 'paid',
        membership_type = $1,
        membership_expiry = $2
       WHERE id = $3`,
      [membership_type, expiryDate, userId]
    );

    // Send email notification
    const fullName = `${user.first_name} ${user.last_name}`;
    await emailService.sendPaymentConfirmedEmail(user.email, fullName);

    res.json({
      success: true,
      message: `${membership_type.charAt(0).toUpperCase() + membership_type.slice(1)} membership assigned successfully`,
      expiry: expiryDate
    });
  } catch (error) {
    console.error('Assign membership error:', error);
    res.status(500).json({ error: 'Failed to assign membership' });
  }
};

// Revoke membership from user
const revokeMembership = async (req, res) => {
  try {
    const { userId } = req.params;

    await db.query(
      `UPDATE users SET
        payment_status = 'unpaid',
        membership_type = NULL,
        membership_expiry = NULL
       WHERE id = $1`,
      [userId]
    );

    res.json({
      success: true,
      message: 'Membership revoked successfully'
    });
  } catch (error) {
    console.error('Revoke membership error:', error);
    res.status(500).json({ error: 'Failed to revoke membership' });
  }
};

// Get full user profile (user + profile data)
const getFullUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await db.query(`
      SELECT
        u.id, u.email, u.first_name, u.middle_name, u.last_name, u.phone, u.age, u.gender,
        u.payment_status, u.membership_type, u.membership_expiry, u.is_approved, u.created_at,
        p.height, p.weight, p.marital_status, p.religion, p.caste, p.mother_tongue,
        p.education, p.occupation, p.annual_income, p.city, p.state, p.country,
        p.about_me, p.looking_for, p.hobbies, p.created_by, p.profile_picture
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE u.id = $1
    `, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Get full user profile error:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

// Update full user profile (user + profile data)
const updateFullUserProfile = async (req, res) => {
  const client = await db.connect();

  // Helper to convert empty strings to null for integer fields
  const toIntOrNull = (value) => {
    if (value === '' || value === null || value === undefined) return null;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? null : parsed;
  };

  try {
    const { userId } = req.params;
    const {
      // User fields
      email,
      first_name,
      middle_name,
      last_name,
      phone,
      age,
      gender,
      payment_status,
      is_approved,
      // Profile fields
      height,
      weight,
      marital_status,
      religion,
      caste,
      mother_tongue,
      education,
      occupation,
      annual_income,
      city,
      state,
      country,
      about_me,
      looking_for,
      hobbies,
      created_by,
      profile_picture
    } = req.body;

    // Convert numeric fields
    const ageInt = toIntOrNull(age);
    const heightInt = toIntOrNull(height);
    const weightInt = toIntOrNull(weight);

    await client.query('BEGIN');

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await client.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, userId]
      );
      if (existingUser.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Email already exists' });
      }
    }

    // Update users table
    await client.query(`
      UPDATE users SET
        email = COALESCE($1, email),
        first_name = COALESCE($2, first_name),
        middle_name = $3,
        last_name = COALESCE($4, last_name),
        phone = $5,
        age = $6,
        gender = COALESCE($7, gender),
        payment_status = COALESCE($8, payment_status),
        is_approved = COALESCE($9, is_approved),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
    `, [email, first_name, middle_name, last_name, phone, ageInt, gender, payment_status, is_approved, userId]);

    // Check if profile exists
    const profileExists = await client.query(
      'SELECT user_id FROM profiles WHERE user_id = $1',
      [userId]
    );

    if (profileExists.rows.length > 0) {
      // Update existing profile
      await client.query(`
        UPDATE profiles SET
          height = $1,
          weight = $2,
          marital_status = $3,
          religion = $4,
          caste = $5,
          mother_tongue = $6,
          education = $7,
          occupation = $8,
          annual_income = $9,
          city = $10,
          state = $11,
          country = $12,
          about_me = $13,
          looking_for = $14,
          hobbies = $15,
          created_by = $16,
          profile_picture = $17
        WHERE user_id = $18
      `, [heightInt, weightInt, marital_status, religion, caste, mother_tongue,
          education, occupation, annual_income, city, state, country,
          about_me, looking_for, hobbies, created_by, profile_picture, userId]);
    } else {
      // Insert new profile
      await client.query(`
        INSERT INTO profiles (
          user_id, height, weight, marital_status, religion, caste, mother_tongue,
          education, occupation, annual_income, city, state, country,
          about_me, looking_for, hobbies, created_by, profile_picture
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      `, [userId, heightInt, weightInt, marital_status, religion, caste, mother_tongue,
          education, occupation, annual_income, city, state, country,
          about_me, looking_for, hobbies, created_by, profile_picture]);
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'User profile updated successfully'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update full user profile error:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  } finally {
    client.release();
  }
};

// Upload photo for a user (admin)
const uploadUserPhoto = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: 'No photo uploaded' });
    }

    const photoUrl = req.file.location;

    // Get old profile picture URL to delete from S3
    const oldPicResult = await db.query(
      'SELECT profile_picture FROM profiles WHERE user_id = $1',
      [userId]
    );

    // Check if profile exists
    const profileExists = await db.query(
      'SELECT user_id FROM profiles WHERE user_id = $1',
      [userId]
    );

    if (profileExists.rows.length > 0) {
      // Update existing profile
      await db.query(
        'UPDATE profiles SET profile_picture = $1 WHERE user_id = $2',
        [photoUrl, userId]
      );
    } else {
      // Create profile with photo
      await db.query(
        'INSERT INTO profiles (user_id, profile_picture) VALUES ($1, $2)',
        [userId, photoUrl]
      );
    }

    // Delete old picture from S3 if exists
    if (oldPicResult.rows.length > 0 && oldPicResult.rows[0].profile_picture) {
      const { deleteFromS3 } = require('../config/s3');
      await deleteFromS3(oldPicResult.rows[0].profile_picture);
    }

    res.json({
      success: true,
      message: 'Photo uploaded successfully',
      profile_picture: photoUrl
    });
  } catch (error) {
    console.error('Upload user photo error:', error);
    res.status(500).json({ error: 'Failed to upload photo' });
  }
};

module.exports = {
  adminLogin,
  getAllUsers,
  updatePaymentStatus,
  setUserPassword,
  getPaidUsersWithoutPassword,
  getDashboardStats,
  updateApprovalStatus,
  deleteUser,
  createUser,
  getAllMatches,
  deleteMatch,
  getApprovedUsers,
  createMatch,
  getAllInterests,
  getInterestsByUser,
  updateUserData,
  getUsersWithPasswords,
  assignMembership,
  revokeMembership,
  getFullUserProfile,
  updateFullUserProfile,
  uploadUserPhoto
};
