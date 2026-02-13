const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const emailService = require('../utils/emailService');

// Admin login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin
    const admins = await db.query('SELECT * FROM admins WHERE email = ?', [email]);

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
        u.id, u.first_name, u.middle_name, u.last_name, u.phone, u.age, u.gender,
        u.payment_status, u.membership_type, u.membership_expiry, u.interested_membership,
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
      'SELECT first_name, last_name, phone FROM users WHERE id = ?',
      [userId]
    );

    const user = userResult.rows[0];

    await db.query(
      'UPDATE users SET payment_status = ? WHERE id = ?',
      [payment_status, userId]
    );

    // Email notification skipped - users no longer have email

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
      'SELECT first_name, last_name, phone, payment_status FROM users WHERE id = ?',
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
      'UPDATE users SET password = ?, plain_password = ?, is_approved = true WHERE id = ?',
      [hashedPassword, password, userId]
    );

    // Email notification skipped - users no longer have email

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
      SELECT id, first_name, middle_name, last_name, phone
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
      "SELECT COUNT(*) as count FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)"
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
        u.id, u.first_name, u.middle_name, u.last_name, u.phone, u.age, u.gender,
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
      'SELECT first_name, last_name, phone FROM users WHERE id = ?',
      [userId]
    );

    const user = userResult.rows[0];

    await db.query(
      'UPDATE users SET is_approved = ? WHERE id = ?',
      [is_approved, userId]
    );

    // Email notification skipped - users no longer have email

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

    await client.query("START TRANSACTION");

    await client.query(
      "DELETE FROM matches WHERE user_id = ?",
      [userId]
    );

    await client.query(
      "DELETE FROM interests WHERE sender_id = ? OR receiver_id = ?",
      [userId, userId]
    );

    await client.query(
      "DELETE FROM profile_views WHERE viewer_id = ? OR viewed_id = ?",
      [userId, userId]
    );

    await client.query(
      "DELETE FROM profiles WHERE user_id = ?",
      [userId]
    );

    await client.query(
      "DELETE FROM preferences WHERE user_id = ?",
      [userId]
    );

    await client.query(
      "DELETE FROM users WHERE id = ?",
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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const result = await db.query(
      `INSERT INTO users (password, first_name, middle_name, last_name, phone, age, gender, payment_status, is_approved)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [hashedPassword, first_name, middle_name, last_name, phone, age, gender, payment_status, is_approved]
    );

    res.json({
      success: true,
      message: 'User created successfully',
      user: { id: result.rows.insertId, first_name, last_name }
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
        CONCAT(u1.first_name, ' ', COALESCE(CONCAT(u1.middle_name, ' '), ''), u1.last_name) as user1_name,
        p1.profile_picture as user1_picture,
        CONCAT(u2.first_name, ' ', COALESCE(CONCAT(u2.middle_name, ' '), ''), u2.last_name) as user2_name,
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

    await db.query('DELETE FROM matches WHERE id = ?', [matchId]);

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
        u.id, u.first_name, u.middle_name, u.last_name, u.phone, u.age, u.gender,
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
       WHERE (user_id = ? AND matched_user_id = ?) OR (user_id = ? AND matched_user_id = ?)`,
      [user1_id, user2_id, user2_id, user1_id]
    );

    if (existingMatch.rows.length > 0) {
      return res.status(400).json({ error: 'Match already exists between these users' });
    }

    // Create match
    await db.query(
      `INSERT INTO matches (user_id, matched_user_id, match_score, status)
       VALUES (?, ?, ?, 'pending')`,
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
        CONCAT(sender.first_name, ' ', COALESCE(CONCAT(sender.middle_name, ' '), ''), sender.last_name) as sender_name,
        sender.age as sender_age,
        sender.gender as sender_gender,
        sp.profile_picture as sender_picture,
        receiver.id as receiver_id,
        CONCAT(receiver.first_name, ' ', COALESCE(CONCAT(receiver.middle_name, ' '), ''), receiver.last_name) as receiver_name,
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
        SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) as accepted,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as declined
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
        CONCAT(receiver.first_name, ' ', COALESCE(CONCAT(receiver.middle_name, ' '), ''), receiver.last_name) as receiver_name,
        receiver.age as receiver_age,
        receiver.gender as receiver_gender
      FROM interests i
      JOIN users receiver ON i.receiver_id = receiver.id
      WHERE i.sender_id = ?
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
        CONCAT(sender.first_name, ' ', COALESCE(CONCAT(sender.middle_name, ' '), ''), sender.last_name) as sender_name,
        sender.age as sender_age,
        sender.gender as sender_gender
      FROM interests i
      JOIN users sender ON i.sender_id = sender.id
      WHERE i.receiver_id = ?
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
      first_name,
      middle_name,
      last_name,
      phone,
      age,
      gender
    } = req.body;

    // Build dynamic update query
    const updates = [];
    const values = [];

    if (first_name) {
      updates.push('first_name = ?');
      values.push(first_name);
    }
    if (middle_name !== undefined) {
      updates.push('middle_name = ?');
      values.push(middle_name);
    }
    if (last_name) {
      updates.push('last_name = ?');
      values.push(last_name);
    }
    if (phone) {
      updates.push('phone = ?');
      values.push(phone);
    }
    if (age) {
      updates.push('age = ?');
      values.push(age);
    }
    if (gender) {
      updates.push('gender = ?');
      values.push(gender);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(userId);

    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    await db.query(query, values);

    // Get updated user
    const result = await db.query('SELECT * FROM users WHERE id = ?', [userId]);

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
        u.id, u.first_name, u.middle_name, u.last_name, u.phone, u.age, u.gender,
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

    // Validate membership type exists in database
    const planResult = await db.query(
      'SELECT name, duration_months FROM membership_plans WHERE LOWER(name) = LOWER(?) AND is_active = true',
      [membership_type]
    );

    if (planResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid membership type' });
    }

    const plan = planResult.rows[0];

    // Get user details
    const userResult = await db.query(
      'SELECT first_name, last_name, phone FROM users WHERE id = ?',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Calculate expiry based on plan duration
    const months = plan.duration_months || 3;

    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + months);

    // Update user with membership
    await db.query(
      `UPDATE users SET
        payment_status = 'paid',
        membership_type = ?,
        membership_expiry = ?
       WHERE id = ?`,
      [membership_type, expiryDate, userId]
    );

    // Email notification skipped - users no longer have email

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
       WHERE id = ?`,
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
        u.id, u.first_name, u.middle_name, u.last_name, u.phone, u.age, u.gender,
        u.payment_status, u.membership_type, u.membership_expiry, u.is_approved, u.created_at,
        p.height, p.weight, p.marital_status, p.religion, p.caste, p.mother_tongue,
        p.education, p.occupation, p.annual_income, p.city, p.state, p.country,
        p.about_me, p.looking_for, p.hobbies, p.created_by, p.profile_picture
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE u.id = ?
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

    await client.query('START TRANSACTION');

    // Update users table
    await client.query(`
      UPDATE users SET
        first_name = COALESCE(?, first_name),
        middle_name = ?,
        last_name = COALESCE(?, last_name),
        phone = ?,
        age = ?,
        gender = COALESCE(?, gender),
        payment_status = COALESCE(?, payment_status),
        is_approved = COALESCE(?, is_approved),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [first_name, middle_name, last_name, phone, ageInt, gender, payment_status, is_approved, userId]);

    // Check if profile exists
    const profileExists = await client.query(
      'SELECT user_id FROM profiles WHERE user_id = ?',
      [userId]
    );

    if (profileExists.rows.length > 0) {
      // Update existing profile
      await client.query(`
        UPDATE profiles SET
          height = ?,
          weight = ?,
          marital_status = ?,
          religion = ?,
          caste = ?,
          mother_tongue = ?,
          education = ?,
          occupation = ?,
          annual_income = ?,
          city = ?,
          state = ?,
          country = ?,
          about_me = ?,
          looking_for = ?,
          hobbies = ?,
          created_by = ?,
          profile_picture = ?
        WHERE user_id = ?
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
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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

    // Upload to S3 with local fallback — file is already saved to disk by multer
    const { uploadFileWithFallback } = require('../config/s3');
    const photoUrl = await uploadFileWithFallback(req.file.path, req.file.originalname, userId, req);

    // Get old profile picture URL to delete from S3/local
    const oldPicResult = await db.query(
      'SELECT profile_picture FROM profiles WHERE user_id = ?',
      [userId]
    );

    // Check if profile exists
    const profileExists = await db.query(
      'SELECT user_id FROM profiles WHERE user_id = ?',
      [userId]
    );

    if (profileExists.rows.length > 0) {
      // Update existing profile
      await db.query(
        'UPDATE profiles SET profile_picture = ? WHERE user_id = ?',
        [photoUrl, userId]
      );
    } else {
      // Create profile with photo
      await db.query(
        'INSERT INTO profiles (user_id, profile_picture) VALUES (?, ?)',
        [userId, photoUrl]
      );
    }

    // Delete old picture from S3/local if exists
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

// Bulk create users
const bulkCreateUsers = async (req, res) => {
  const client = await db.connect();
  try {
    const { users } = req.body;

    if (!users || !Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ error: 'No users provided for bulk upload' });
    }

    const results = {
      success: [],
      failed: [],
      total: users.length
    };

    await client.query('START TRANSACTION');

    for (const userData of users) {
      try {
        const {
          first_name,
          middle_name,
          last_name,
          phone,
          age,
          gender,
          password,
          payment_status = 'unpaid',
          is_approved = false
        } = userData;

        // Validate required fields
        if (!first_name || !last_name || !phone || !age || !gender) {
          results.failed.push({
            phone: phone || 'Unknown',
            error: 'Missing required fields (first_name, last_name, phone, age, gender)'
          });
          continue;
        }

        // Check if phone already exists
        const existingPhone = await client.query('SELECT id FROM users WHERE phone = ?', [phone]);
        if (existingPhone.rows.length > 0) {
          results.failed.push({
            phone,
            error: 'Phone number already exists'
          });
          continue;
        }

        // Hash password if provided, otherwise generate a random one
        const userPassword = password || Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(userPassword, 10);

        // Insert user
        const result = await client.query(
          `INSERT INTO users (password, plain_password, first_name, middle_name, last_name, phone, age, gender, payment_status, is_approved)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [hashedPassword, userPassword, first_name, middle_name || null, last_name, phone, age, gender, payment_status, is_approved]
        );

        results.success.push({
          id: result.rows.insertId,
          phone,
          name: `${first_name} ${last_name}`,
          password: userPassword
        });
      } catch (userError) {
        results.failed.push({
          phone: userData.phone || 'Unknown',
          error: userError.message
        });
      }
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      message: `Bulk upload completed: ${results.success.length} succeeded, ${results.failed.length} failed`,
      results
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Bulk create users error:', error);
    res.status(500).json({ error: 'Failed to bulk create users' });
  } finally {
    client.release();
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
  bulkCreateUsers,
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
