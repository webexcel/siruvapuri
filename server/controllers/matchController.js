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
      WHERE u.id = $1
      `,
      [userId]
    );

    if (currentUserResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = currentUserResult.rows[0];

    /* ---------------------------------------
       2. Eligibility checks (VERY IMPORTANT)
    ---------------------------------------- */
    if (!user.gender) {
      return res.status(400).json({
        error: 'Complete your profile (gender missing)'
      });
    }

    if (!user.is_approved || user.payment_status !== 'paid') {
      return res.status(403).json({
        error: 'User not eligible for recommendations'
      });
    }

    /* ---------------------------------------
       3. Fetch preferences (optional)
    ---------------------------------------- */
    const preferencesResult = await db.query(
      'SELECT * FROM preferences WHERE user_id = $1',
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
        u.first_name || COALESCE(' ' || u.middle_name, '') || ' ' || u.last_name AS full_name,
        u.gender,
        u.age,
        u.membership_type,
        u.membership_expiry,
        CASE
          WHEN u.membership_expiry IS NOT NULL AND u.membership_expiry > NOW() THEN true
          ELSE false
        END as is_membership_active,
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
      WHERE u.gender = $1
        AND u.id <> $2
        AND u.is_approved = true
        AND u.payment_status = 'paid'
        AND u.id NOT IN (
          SELECT matched_user_id FROM matches WHERE user_id = $3
          UNION
          SELECT receiver_id FROM interests WHERE sender_id = $4
        )
      LIMIT 50
      `,
      [oppositeGender, userId, userId, userId]
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
      religion, education, city, marital_status,
      limit = 20, offset = 0
    } = req.query;

    let query = `
      SELECT u.id,
             u.first_name || COALESCE(' ' || u.middle_name, '') || ' ' || u.last_name as full_name,
             u.gender, u.age, u.membership_type,
             CASE
               WHEN u.membership_expiry IS NOT NULL AND u.membership_expiry > NOW() THEN true
               ELSE false
             END as is_membership_active,
             p.height, p.weight, p.marital_status, p.religion, p.caste, p.mother_tongue,
             p.education, p.occupation, p.annual_income, p.city, p.state, p.country,
             p.about_me, p.profile_picture, p.looking_for, p.hobbies
      FROM users u
      INNER JOIN profiles p ON u.id = p.user_id
      WHERE u.id != $1
      AND u.is_approved = true
      AND u.payment_status = 'paid'
      AND u.id NOT IN (
        SELECT receiver_id FROM interests WHERE sender_id = $1
      )
    `;

    const params = [userId];
    let paramIndex = 2;

    // Get current user gender and determine opposite gender
    const currentUserResult = await db.query('SELECT gender FROM users WHERE id = $1', [userId]);
    const userGender = currentUserResult.rows[0]?.gender;
    const oppositeGender = userGender === 'male' ? 'female' : 'male';

    query += ` AND u.gender = $${paramIndex}`;
    params.push(oppositeGender);
    paramIndex++;

    if (age_min) {
      query += ` AND u.age >= $${paramIndex}`;
      params.push(age_min);
      paramIndex++;
    }

    if (age_max) {
      query += ` AND u.age <= $${paramIndex}`;
      params.push(age_max);
      paramIndex++;
    }

    if (height_min) {
      query += ` AND p.height >= $${paramIndex}`;
      params.push(height_min);
      paramIndex++;
    }

    if (height_max) {
      query += ` AND p.height <= $${paramIndex}`;
      params.push(height_max);
      paramIndex++;
    }

    if (religion) {
      query += ` AND p.religion = $${paramIndex}`;
      params.push(religion);
      paramIndex++;
    }

    if (education) {
      query += ` AND p.education LIKE $${paramIndex}`;
      params.push(`%${education}%`);
      paramIndex++;
    }

    if (city) {
      query += ` AND p.city LIKE $${paramIndex}`;
      params.push(`%${city}%`);
      paramIndex++;
    }

    if (marital_status) {
      query += ` AND p.marital_status = $${paramIndex}`;
      params.push(marital_status);
      paramIndex++;
    }

    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await db.query(query, params);

    res.json({
      profiles: result.rows,
      total: result.rows.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
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
      'SELECT id FROM users WHERE id = $1',
      [receiverId]
    );

    if (receiverCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if interest already exists
    const existingResult = await db.query(
      'SELECT id FROM interests WHERE sender_id = $1 AND receiver_id = $2',
      [senderId, receiverId]
    );

    if (existingResult.rows.length > 0) {
      return res.status(400).json({ error: 'Interest already sent to this user' });
    }

    // Get sender details
    const senderResult = await db.query(
      `SELECT u.first_name || COALESCE(' ' || u.middle_name, '') || ' ' || u.last_name as full_name,
              u.age, p.city, p.education
       FROM users u
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE u.id = $1`,
      [senderId]
    );

    // Get receiver details
    const receiverResult = await db.query(
      `SELECT u.email,
              u.first_name || COALESCE(' ' || u.middle_name, '') || ' ' || u.last_name as full_name
       FROM users u
       WHERE u.id = $1`,
      [receiverId]
    );

    await db.query(
      'INSERT INTO interests (sender_id, receiver_id, message) VALUES ($1, $2, $3)',
      [senderId, receiverId, message || '']
    );

    // Send email notification to receiver
    if (senderResult.rows.length > 0 && receiverResult.rows.length > 0) {
      const sender = senderResult.rows[0];
      const receiver = receiverResult.rows[0];

      try {
        await emailService.sendInterestReceivedEmail(
          receiver.email,
          sender.full_name,
          receiver.full_name,
          {
            age: sender.age,
            location: sender.city,
            education: sender.education
          }
        );
      } catch (emailError) {
        console.error('Failed to send interest notification email:', emailError);
        // Don't fail the request if email fails
      }
    }

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
              u.first_name || COALESCE(' ' || u.middle_name, '') || ' ' || u.last_name as full_name,
              u.gender, u.age, u.membership_type,
              CASE WHEN u.membership_expiry IS NOT NULL AND u.membership_expiry > NOW() THEN true ELSE false END as is_membership_active,
              p.city, p.education, p.occupation, p.profile_picture
       FROM interests i
       INNER JOIN users u ON i.sender_id = u.id
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE i.receiver_id = $1
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
              u.first_name || COALESCE(' ' || u.middle_name, '') || ' ' || u.last_name as full_name,
              u.gender, u.age, u.membership_type,
              CASE WHEN u.membership_expiry IS NOT NULL AND u.membership_expiry > NOW() THEN true ELSE false END as is_membership_active,
              p.city, p.education, p.occupation, p.profile_picture
       FROM interests i
       INNER JOIN users u ON i.receiver_id = u.id
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE i.sender_id = $1
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
              sender.email as sender_email,
              sender.first_name || COALESCE(' ' || sender.middle_name, '') || ' ' || sender.last_name as sender_name,
              receiver.first_name || COALESCE(' ' || receiver.middle_name, '') || ' ' || receiver.last_name as receiver_name
       FROM interests i
       JOIN users sender ON i.sender_id = sender.id
       JOIN users receiver ON i.receiver_id = receiver.id
       WHERE i.id = $1 AND i.receiver_id = $2`,
      [interest_id, userId]
    );

    if (interestResult.rows.length === 0) {
      return res.status(404).json({ error: 'Interest not found' });
    }

    const interest = interestResult.rows[0];

    await db.query(
      'UPDATE interests SET status = $1 WHERE id = $2',
      [status, interest_id]
    );

    // Send email notification if accepted
    if (status === 'accepted') {
      try {
        await emailService.sendInterestAcceptedEmail(
          interest.sender_email,
          interest.receiver_name,
          interest.sender_name
        );
      } catch (emailError) {
        console.error('Failed to send interest accepted email:', emailError);
        // Don't fail the request if email fails
      }
    }

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
        u.first_name || COALESCE(' ' || u.middle_name, '') || ' ' || u.last_name as full_name,
        u.gender, u.age,
        p.height, p.weight, p.marital_status, p.religion, p.caste, p.mother_tongue,
        p.education, p.occupation, p.annual_income, p.city, p.state, p.country,
        p.about_me, p.profile_picture, p.looking_for, p.hobbies
       FROM matches m
       INNER JOIN users u ON m.matched_user_id = u.id
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE m.user_id = $1
       ORDER BY m.match_score DESC, m.created_at DESC
       LIMIT 10`,
      [userId]
    );

    res.json({ topMatches: result.rows });
  } catch (error) {
    console.error('Get top matches error:', error);
    res.status(500).json({ error: 'Failed to fetch top matches' });
  }
};

module.exports = {
  getDailyRecommendations,
  searchProfiles,
  sendInterest,
  getReceivedInterests,
  getSentInterests,
  respondToInterest,
  getTopMatches
};
