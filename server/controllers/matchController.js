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
    const [currentUser] = await db.query(
      `SELECT u.*, p.*, TIMESTAMPDIFF(YEAR, u.date_of_birth, CURDATE()) as age
       FROM users u
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE u.id = ?`,
      [userId]
    );

    // Get user preferences
    const [userPreferences] = await db.query(
      'SELECT * FROM preferences WHERE user_id = ?',
      [userId]
    );

    const user = currentUser[0];
    const preferences = userPreferences[0] || {};

    // Get opposite gender profiles that user hasn't interacted with
    const [profiles] = await db.query(
      `SELECT u.id, u.full_name, u.gender, u.date_of_birth,
              p.height, p.weight, p.marital_status, p.religion, p.caste, p.mother_tongue,
              p.education, p.occupation, p.annual_income, p.city, p.state, p.country,
              p.about_me, p.profile_picture, p.looking_for, p.hobbies,
              TIMESTAMPDIFF(YEAR, u.date_of_birth, CURDATE()) as age
       FROM users u
       INNER JOIN profiles p ON u.id = p.user_id
       WHERE u.gender != ?
       AND u.id != ?
       AND u.id NOT IN (
         SELECT matched_user_id FROM matches WHERE user_id = ?
         UNION
         SELECT receiver_id FROM interests WHERE sender_id = ?
       )
       LIMIT 50`,
      [user.gender, userId, userId, userId]
    );

    // Calculate match scores
    const recommendations = profiles.map(profile => ({
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
             TIMESTAMPDIFF(YEAR, u.date_of_birth, CURDATE()) as age
      FROM users u
      INNER JOIN profiles p ON u.id = p.user_id
      WHERE u.id != ?
    `;

    const params = [userId];

    // Get current user gender
    const [currentUser] = await db.query('SELECT gender FROM users WHERE id = ?', [userId]);
    const userGender = currentUser[0].gender;

    query += ` AND u.gender != ?`;
    params.push(userGender);

    if (age_min) {
      query += ` AND TIMESTAMPDIFF(YEAR, u.date_of_birth, CURDATE()) >= ?`;
      params.push(age_min);
    }

    if (age_max) {
      query += ` AND TIMESTAMPDIFF(YEAR, u.date_of_birth, CURDATE()) <= ?`;
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

    if (education) {
      query += ` AND p.education LIKE ?`;
      params.push(`%${education}%`);
    }

    if (city) {
      query += ` AND p.city LIKE ?`;
      params.push(`%${city}%`);
    }

    if (marital_status) {
      query += ` AND p.marital_status = ?`;
      params.push(marital_status);
    }

    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const [profiles] = await db.query(query, params);

    res.json({
      profiles,
      total: profiles.length,
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
    const [existing] = await db.query(
      'SELECT id FROM interests WHERE sender_id = ? AND receiver_id = ?',
      [senderId, receiver_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Interest already sent' });
    }

    await db.query(
      'INSERT INTO interests (sender_id, receiver_id, message) VALUES (?, ?, ?)',
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

    const [interests] = await db.query(
      `SELECT i.id, i.sender_id, i.status, i.message, i.created_at,
              u.full_name, u.gender, u.date_of_birth,
              p.city, p.education, p.occupation, p.profile_picture,
              TIMESTAMPDIFF(YEAR, u.date_of_birth, CURDATE()) as age
       FROM interests i
       INNER JOIN users u ON i.sender_id = u.id
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE i.receiver_id = ?
       ORDER BY i.created_at DESC`,
      [userId]
    );

    res.json({ interests });
  } catch (error) {
    console.error('Get interests error:', error);
    res.status(500).json({ error: 'Failed to fetch interests' });
  }
};

// Get sent interests
const getSentInterests = async (req, res) => {
  try {
    const userId = req.userId;

    const [interests] = await db.query(
      `SELECT i.id, i.receiver_id, i.status, i.message, i.created_at,
              u.full_name, u.gender, u.date_of_birth,
              p.city, p.education, p.occupation, p.profile_picture,
              TIMESTAMPDIFF(YEAR, u.date_of_birth, CURDATE()) as age
       FROM interests i
       INNER JOIN users u ON i.receiver_id = u.id
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE i.sender_id = ?
       ORDER BY i.created_at DESC`,
      [userId]
    );

    res.json({ interests });
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
    const [interest] = await db.query(
      'SELECT * FROM interests WHERE id = ? AND receiver_id = ?',
      [interest_id, userId]
    );

    if (interest.length === 0) {
      return res.status(404).json({ error: 'Interest not found' });
    }

    await db.query(
      'UPDATE interests SET status = ? WHERE id = ?',
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
