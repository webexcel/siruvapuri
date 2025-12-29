const db = require('../config/database');

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
    const userId = req.userId;
    const limit = parseInt(req.query.limit) || 10;

    // Get current user data
    const currentUserResult = await db.query(
      `SELECT u.*, p.*, EXTRACT(YEAR FROM AGE(CURRENT_DATE, u.date_of_birth))::INTEGER as age
       FROM users u
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE u.id = $1`,
      [userId]
    );

    // Get user preferences
    const userPreferencesResult = await db.query(
      'SELECT * FROM preferences WHERE user_id = $1',
      [userId]
    );

    const user = currentUserResult.rows[0];
    const preferences = userPreferencesResult.rows[0] || {};

    // Get opposite gender profiles that user hasn't interacted with
    const profilesResult = await db.query(
      `SELECT u.id, u.full_name, u.gender, u.date_of_birth,
              p.height, p.weight, p.marital_status, p.religion, p.caste, p.mother_tongue,
              p.education, p.occupation, p.annual_income, p.city, p.state, p.country,
              p.about_me, p.profile_picture, p.looking_for, p.hobbies,
              EXTRACT(YEAR FROM AGE(CURRENT_DATE, u.date_of_birth))::INTEGER as age
       FROM users u
       INNER JOIN profiles p ON u.id = p.user_id
       WHERE u.gender != $1
       AND u.id != $2
       AND u.id NOT IN (
         SELECT matched_user_id FROM matches WHERE user_id = $3
         UNION
         SELECT receiver_id FROM interests WHERE sender_id = $4
       )
       LIMIT 50`,
      [user.gender, userId, userId, userId]
    );

    // Calculate match scores
    const recommendations = profilesResult.rows.map(profile => ({
      ...profile,
      match_score: calculateMatchScore(user, profile, preferences)
    }));

    // Sort by match score
    recommendations.sort((a, b) => b.match_score - a.match_score);

    res.json({
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
      SELECT u.id, u.full_name, u.gender, u.date_of_birth,
             p.height, p.weight, p.marital_status, p.religion, p.caste, p.mother_tongue,
             p.education, p.occupation, p.annual_income, p.city, p.state, p.country,
             p.about_me, p.profile_picture, p.looking_for, p.hobbies,
             EXTRACT(YEAR FROM AGE(CURRENT_DATE, u.date_of_birth))::INTEGER as age
      FROM users u
      INNER JOIN profiles p ON u.id = p.user_id
      WHERE u.id != $1
    `;

    const params = [userId];
    let paramIndex = 2;

    // Get current user gender
    const currentUserResult = await db.query('SELECT gender FROM users WHERE id = $1', [userId]);
    const userGender = currentUserResult.rows[0].gender;

    query += ` AND u.gender != $${paramIndex}`;
    params.push(userGender);
    paramIndex++;

    if (age_min) {
      query += ` AND EXTRACT(YEAR FROM AGE(CURRENT_DATE, u.date_of_birth))::INTEGER >= $${paramIndex}`;
      params.push(age_min);
      paramIndex++;
    }

    if (age_max) {
      query += ` AND EXTRACT(YEAR FROM AGE(CURRENT_DATE, u.date_of_birth))::INTEGER <= $${paramIndex}`;
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

    if (senderId === receiver_id) {
      return res.status(400).json({ error: 'Cannot send interest to yourself' });
    }

    // Check if interest already exists
    const existingResult = await db.query(
      'SELECT id FROM interests WHERE sender_id = $1 AND receiver_id = $2',
      [senderId, receiver_id]
    );

    if (existingResult.rows.length > 0) {
      return res.status(400).json({ error: 'Interest already sent' });
    }

    await db.query(
      'INSERT INTO interests (sender_id, receiver_id, message) VALUES ($1, $2, $3)',
      [senderId, receiver_id, message || '']
    );

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
              u.full_name, u.gender, u.date_of_birth,
              p.city, p.education, p.occupation, p.profile_picture,
              EXTRACT(YEAR FROM AGE(CURRENT_DATE, u.date_of_birth))::INTEGER as age
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
              u.full_name, u.gender, u.date_of_birth,
              p.city, p.education, p.occupation, p.profile_picture,
              EXTRACT(YEAR FROM AGE(CURRENT_DATE, u.date_of_birth))::INTEGER as age
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

    // Verify the interest belongs to the user
    const interestResult = await db.query(
      'SELECT * FROM interests WHERE id = $1 AND receiver_id = $2',
      [interest_id, userId]
    );

    if (interestResult.rows.length === 0) {
      return res.status(404).json({ error: 'Interest not found' });
    }

    await db.query(
      'UPDATE interests SET status = $1 WHERE id = $2',
      [status, interest_id]
    );

    res.json({ message: `Interest ${status} successfully` });
  } catch (error) {
    console.error('Respond to interest error:', error);
    res.status(500).json({ error: 'Failed to respond to interest' });
  }
};

module.exports = {
  getDailyRecommendations,
  searchProfiles,
  sendInterest,
  getReceivedInterests,
  getSentInterests,
  respondToInterest
};
