const db = require('../config/database');
const emailService = require('../utils/emailService');

// Calculate match score based on preferences
const calculateMatchScore = (user, profile, preferences) => {
  let score = 0;

  // Age match (30 points)
  const age = profile.age;
  if (age >= preferences.age_min && age <= preferences.age_max) {
    score += 30;
  } else {
    const ageDiff = Math.min(Math.abs(age - preferences.age_min), Math.abs(age - preferences.age_max));
    score += Math.max(0, 30 - ageDiff * 2);
  }

  // Height match (20 points)
  if (profile.height >= preferences.height_min && profile.height <= preferences.height_max) {
    score += 20;
  }

  // Education match (15 points)
  if (preferences.education && profile.education && profile.education.toLowerCase().includes(preferences.education.toLowerCase())) {
    score += 15;
  }

  // Religion match (15 points)
  if (preferences.religion && profile.religion === preferences.religion) {
    score += 15;
  }

  // Location match (10 points)
  if (preferences.location && profile.city && profile.city.toLowerCase().includes(preferences.location.toLowerCase())) {
    score += 10;
  }

  // Marital status match (10 points)
  if (preferences.marital_status && profile.marital_status === preferences.marital_status) {
    score += 10;
  }

  return Math.min(100, Math.round(score));
};

// Get daily recommendations
const getDailyRecommendations = async (req, res) => {
  try {
    const userId = req.userId; // must come from auth middleware
    const limit = parseInt(req.query.limit) || 10;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    /* ---------------------------------------
       1. Fetch current user (STRICT CHECK)
    ---------------------------------------- */
    const currentUserResult = await db.query(
      `
      SELECT
        u.id,
        u.gender,
        u.age,
        u.is_approved,
        u.payment_status,
        p.height,
        p.marital_status,
        p.religion,
        p.education,
        p.city
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE u.id = ?
      `,
      [userId]
    );

    if (currentUserResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = currentUserResult.rows[0];

    /* ---------------------------------------
       2. Eligibility checks
    ---------------------------------------- */
    if (!user.gender) {
      return res.status(400).json({
        error: 'Complete your profile (gender missing)'
      });
    }

    /* ---------------------------------------
       3. Fetch preferences (optional)
    ---------------------------------------- */
    const preferencesResult = await db.query(
      'SELECT * FROM preferences WHERE user_id = ?',
      [userId]
    );

    const preferences = preferencesResult.rows[0] || {};

    /* ---------------------------------------
       4. Fetch opposite gender profiles
       - Determine opposite gender explicitly
    ---------------------------------------- */
    const oppositeGender = user.gender === 'male' ? 'female' : 'male';

    const profilesResult = await db.query(
      `
      SELECT
        u.id,
        CONCAT(u.first_name, COALESCE(CONCAT(' ', u.middle_name), ''), ' ', u.last_name) AS full_name,
        u.gender,
        u.age,
        u.membership_type,
        u.membership_expiry,
        CASE
          WHEN u.membership_expiry IS NOT NULL AND u.membership_expiry > NOW() THEN true
          ELSE false
        END as is_membership_active,
        CASE
          WHEN EXISTS (SELECT 1 FROM interests WHERE sender_id = ? AND receiver_id = u.id) THEN true
          ELSE false
        END as interest_sent,
        p.height,
        p.weight,
        p.marital_status,
        p.religion,
        p.caste,
        p.mother_tongue,
        p.education,
        p.occupation,
        p.annual_income,
        p.city,
        p.state,
        p.country,
        p.about_me,
        p.profile_picture,
        p.looking_for,
        p.hobbies
      FROM users u
      INNER JOIN profiles p ON u.id = p.user_id
      WHERE u.gender = ?
        AND u.id <> ?
        AND (u.is_approved = true OR u.payment_status = 'paid')
      ORDER BY u.created_at DESC
      LIMIT 50
      `,
      [userId, oppositeGender, userId]
    );

    /* ---------------------------------------
       5. Calculate match score safely
    ---------------------------------------- */
    const recommendations = profilesResult.rows.map(profile => ({
      ...profile,
      match_score: calculateMatchScore(user, profile, preferences)
    }));

    recommendations.sort((a, b) => b.match_score - a.match_score);

    res.json({
      success: true,
      recommendations: recommendations.slice(0, limit),
      total: recommendations.length
    });

  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
};


// Search profiles
const searchProfiles = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      age_min, age_max, height_min, height_max,
      religion, caste, city, marital_status,
      limit = 50, offset = 0
    } = req.query;

    let query = `
      SELECT u.id,
             CONCAT(u.first_name, COALESCE(CONCAT(' ', u.middle_name), ''), ' ', u.last_name) as full_name,
             u.gender, u.age, u.membership_type,
             CASE
               WHEN u.membership_expiry IS NOT NULL AND u.membership_expiry > NOW() THEN true
               ELSE false
             END as is_membership_active,
             CASE
               WHEN EXISTS (SELECT 1 FROM interests WHERE sender_id = ? AND receiver_id = u.id) THEN true
               ELSE false
             END as interest_sent,
             p.height, p.weight, p.marital_status, p.religion, p.caste, p.mother_tongue,
             p.education, p.occupation, p.annual_income, p.city, p.state, p.country,
             p.about_me, p.profile_picture, p.looking_for, p.hobbies
      FROM users u
      INNER JOIN profiles p ON u.id = p.user_id
      WHERE u.id != ?
      AND (u.is_approved = true OR u.payment_status = 'paid')
    `;

    const params = [userId, userId];

    // Get current user gender and determine opposite gender
    const currentUserResult = await db.query('SELECT gender FROM users WHERE id = ?', [userId]);
    const userGender = currentUserResult.rows[0]?.gender;
    const oppositeGender = userGender === 'male' ? 'female' : 'male';

    query += ` AND u.gender = ?`;
    params.push(oppositeGender);

    if (age_min) {
      query += ` AND u.age >= ?`;
      params.push(age_min);
    }

    if (age_max) {
      query += ` AND u.age <= ?`;
      params.push(age_max);
    }

    if (height_min) {
      query += ` AND p.height >= ?`;
      params.push(height_min);
    }

    if (height_max) {
      query += ` AND p.height <= ?`;
      params.push(height_max);
    }

    if (religion) {
      query += ` AND p.religion = ?`;
      params.push(religion);
    }

    if (caste) {
      query += ` AND p.caste LIKE ?`;
      params.push(`%${caste}%`);
    }

    if (city) {
      query += ` AND p.city LIKE ?`;
      params.push(`%${city}%`);
    }

    if (marital_status) {
      query += ` AND p.marital_status = ?`;
      params.push(marital_status);
    }

    // MySQL prepared statements don't work well with LIMIT/OFFSET as parameters
    // So we embed them directly (they're already sanitized as integers)
    const limitInt = parseInt(limit) || 50;
    const offsetInt = parseInt(offset) || 0;
    query += ` ORDER BY u.id DESC LIMIT ${limitInt} OFFSET ${offsetInt}`;

    const result = await db.query(query, params);

    res.json({
      profiles: result.rows,
      total: result.rows.length,
      limit: limitInt,
      offset: offsetInt
    });
  } catch (error) {
    console.error('Search profiles error:', error);
    res.status(500).json({ error: 'Failed to search profiles' });
  }
};

// Send interest
const sendInterest = async (req, res) => {
  try {
    const senderId = req.userId;
    const { receiver_id, message } = req.body;

    // Validate receiver_id
    const receiverId = parseInt(receiver_id);
    if (!receiverId || isNaN(receiverId)) {
      return res.status(400).json({ error: 'Invalid receiver ID' });
    }

    if (senderId === receiverId) {
      return res.status(400).json({ error: 'Cannot send interest to yourself' });
    }

    // Check if receiver exists
    const receiverCheck = await db.query(
      'SELECT id FROM users WHERE id = ?',
      [receiverId]
    );

    if (receiverCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if interest already exists
    const existingResult = await db.query(
      'SELECT id FROM interests WHERE sender_id = ? AND receiver_id = ?',
      [senderId, receiverId]
    );

    if (existingResult.rows.length > 0) {
      return res.status(400).json({ error: 'Interest already sent to this user' });
    }

    // Get sender details
    const senderResult = await db.query(
      `SELECT CONCAT(u.first_name, COALESCE(CONCAT(' ', u.middle_name), ''), ' ', u.last_name) as full_name,
              u.age, p.city, p.education
       FROM users u
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE u.id = ?`,
      [senderId]
    );

    // Get receiver details
    const receiverResult = await db.query(
      `SELECT CONCAT(u.first_name, COALESCE(CONCAT(' ', u.middle_name), ''), ' ', u.last_name) as full_name
       FROM users u
       WHERE u.id = ?`,
      [receiverId]
    );

    await db.query(
      'INSERT INTO interests (sender_id, receiver_id, message) VALUES (?, ?, ?)',
      [senderId, receiverId, message || '']
    );

    // Email notification skipped - users no longer have email

    res.status(201).json({ message: 'Interest sent successfully' });
  } catch (error) {
    console.error('Send interest error:', error);
    res.status(500).json({ error: 'Failed to send interest' });
  }
};

// Get received interests
const getReceivedInterests = async (req, res) => {
  try {
    const userId = req.userId;

    const result = await db.query(
      `SELECT i.id, i.sender_id, i.status, i.message, i.created_at,
              CONCAT(u.first_name, COALESCE(CONCAT(' ', u.middle_name), ''), ' ', u.last_name) as full_name,
              u.gender, u.age, u.membership_type,
              CASE WHEN u.membership_expiry IS NOT NULL AND u.membership_expiry > NOW() THEN true ELSE false END as is_membership_active,
              p.city, p.education, p.occupation, p.profile_picture
       FROM interests i
       INNER JOIN users u ON i.sender_id = u.id
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE i.receiver_id = ?
       ORDER BY i.created_at DESC`,
      [userId]
    );

    res.json({ interests: result.rows });
  } catch (error) {
    console.error('Get interests error:', error);
    res.status(500).json({ error: 'Failed to fetch interests' });
  }
};

// Get sent interests
const getSentInterests = async (req, res) => {
  try {
    const userId = req.userId;

    const result = await db.query(
      `SELECT i.id, i.receiver_id, i.status, i.message, i.created_at,
              CONCAT(u.first_name, COALESCE(CONCAT(' ', u.middle_name), ''), ' ', u.last_name) as full_name,
              u.gender, u.age, u.membership_type,
              CASE WHEN u.membership_expiry IS NOT NULL AND u.membership_expiry > NOW() THEN true ELSE false END as is_membership_active,
              p.city, p.education, p.occupation, p.profile_picture
       FROM interests i
       INNER JOIN users u ON i.receiver_id = u.id
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE i.sender_id = ?
       ORDER BY i.created_at DESC`,
      [userId]
    );

    res.json({ interests: result.rows });
  } catch (error) {
    console.error('Get sent interests error:', error);
    res.status(500).json({ error: 'Failed to fetch sent interests' });
  }
};

// Respond to interest
const respondToInterest = async (req, res) => {
  try {
    const userId = req.userId;
    const { interest_id, status } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Verify the interest belongs to the user and get sender details
    const interestResult = await db.query(
      `SELECT i.*,
              CONCAT(sender.first_name, COALESCE(CONCAT(' ', sender.middle_name), ''), ' ', sender.last_name) as sender_name,
              CONCAT(receiver.first_name, COALESCE(CONCAT(' ', receiver.middle_name), ''), ' ', receiver.last_name) as receiver_name
       FROM interests i
       JOIN users sender ON i.sender_id = sender.id
       JOIN users receiver ON i.receiver_id = receiver.id
       WHERE i.id = ? AND i.receiver_id = ?`,
      [interest_id, userId]
    );

    if (interestResult.rows.length === 0) {
      return res.status(404).json({ error: 'Interest not found' });
    }

    const interest = interestResult.rows[0];

    await db.query(
      'UPDATE interests SET status = ? WHERE id = ?',
      [status, interest_id]
    );

    // Email notification skipped - users no longer have email

    res.json({ message: `Interest ${status} successfully` });
  } catch (error) {
    console.error('Respond to interest error:', error);
    res.status(500).json({ error: 'Failed to respond to interest' });
  }
};

// Get admin-assigned top matches for user
const getTopMatches = async (req, res) => {
  try {
    const userId = req.userId;

    const result = await db.query(
      `SELECT
        m.id as match_id,
        m.match_score,
        m.status as match_status,
        m.created_at as matched_at,
        u.id,
        CONCAT(u.first_name, COALESCE(CONCAT(' ', u.middle_name), ''), ' ', u.last_name) as full_name,
        u.gender, u.age,
        CASE
          WHEN EXISTS (SELECT 1 FROM interests WHERE sender_id = ? AND receiver_id = u.id) THEN true
          ELSE false
        END as interest_sent,
        p.height, p.weight, p.marital_status, p.religion, p.caste, p.mother_tongue,
        p.education, p.occupation, p.annual_income, p.city, p.state, p.country,
        p.about_me, p.profile_picture, p.looking_for, p.hobbies
       FROM matches m
       INNER JOIN users u ON m.matched_user_id = u.id
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE m.user_id = ?
       ORDER BY m.match_score DESC, m.created_at DESC
       LIMIT 10`,
      [userId, userId]
    );

    res.json({ topMatches: result.rows });
  } catch (error) {
    console.error('Get top matches error:', error);
    res.status(500).json({ error: 'Failed to fetch top matches' });
  }
};

// Public search - returns profiles with sensitive info redacted
const publicSearchProfiles = async (req, res) => {
  try {
    const {
      age_min, age_max,
      religion, caste, city, marital_status, gender,
      limit = 50, offset = 0
    } = req.query;

    let query = `
      SELECT u.id,
             CONCAT(u.first_name, ' ', LEFT(u.last_name, 1), '.') as full_name,
             u.gender, u.age,
             p.height, p.marital_status, p.religion, p.caste,
             p.education, p.occupation,
             p.city, p.state, p.country,
             p.about_me, p.profile_picture
      FROM users u
      INNER JOIN profiles p ON u.id = p.user_id
      WHERE (u.is_approved = true OR u.payment_status = 'paid')
    `;

    const params = [];

    if (gender) {
      query += ` AND u.gender = ?`;
      params.push(gender);
    }

    if (age_min) {
      query += ` AND u.age >= ?`;
      params.push(age_min);
    }

    if (age_max) {
      query += ` AND u.age <= ?`;
      params.push(age_max);
    }

    if (religion) {
      query += ` AND p.religion = ?`;
      params.push(religion);
    }

    if (caste) {
      query += ` AND p.caste LIKE ?`;
      params.push(`%${caste}%`);
    }

    if (city) {
      query += ` AND p.city LIKE ?`;
      params.push(`%${city}%`);
    }

    if (marital_status) {
      query += ` AND p.marital_status = ?`;
      params.push(marital_status);
    }

    // MySQL prepared statements don't work well with LIMIT/OFFSET as parameters
    // So we embed them directly (they're already sanitized as integers)
    const limitInt = parseInt(limit) || 50;
    const offsetInt = parseInt(offset) || 0;
    query += ` ORDER BY u.created_at DESC LIMIT ${limitInt} OFFSET ${offsetInt}`;

    const result = await db.query(query, params.length > 0 ? params : undefined);

    // Redact sensitive information - replace with placeholder
    const profiles = result.rows.map(profile => ({
      ...profile,
      // These will be shown as blurred/hidden in frontend
      phone: '**********',
      email: '***@***.com',
      full_address: 'Register to view'
    }));

    res.json({
      profiles,
      total: profiles.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Public search profiles error:', error);
    res.status(500).json({ error: 'Failed to search profiles' });
  }
};

module.exports = {
  getDailyRecommendations,
  searchProfiles,
  publicSearchProfiles,
  sendInterest,
  getReceivedInterests,
  getSentInterests,
  respondToInterest,
  getTopMatches
};
