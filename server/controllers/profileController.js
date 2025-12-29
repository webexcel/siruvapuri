const db = require('../config/database');

// Update profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const profileData = req.body;

    const allowedFields = [
      'height', 'weight', 'marital_status', 'religion', 'caste', 'mother_tongue',
      'education', 'occupation', 'annual_income', 'city', 'state', 'country',
      'about_me', 'profile_picture', 'looking_for', 'hobbies', 'created_by'
    ];

    const updateFields = [];
    const updateValues = [];

    allowedFields.forEach(field => {
      if (profileData[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        updateValues.push(profileData[field]);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    updateValues.push(userId);

    await db.query(
      `UPDATE profiles SET ${updateFields.join(', ')} WHERE user_id = ?`,
      updateValues
    );

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// Get user profile by ID
const getProfileById = async (req, res) => {
  try {
    const { id } = req.params;
    const viewerId = req.userId;

    const [profiles] = await db.query(
      `SELECT u.id, u.full_name, u.gender, u.date_of_birth,
              p.height, p.weight, p.marital_status, p.religion, p.caste, p.mother_tongue,
              p.education, p.occupation, p.annual_income, p.city, p.state, p.country,
              p.about_me, p.profile_picture, p.looking_for, p.hobbies, p.created_by,
              TIMESTAMPDIFF(YEAR, u.date_of_birth, CURDATE()) as age
       FROM users u
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE u.id = ?`,
      [id]
    );

    if (profiles.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Record profile view
    if (viewerId !== parseInt(id)) {
      await db.query(
        'INSERT INTO profile_views (viewer_id, viewed_id) VALUES (?, ?)',
        [viewerId, id]
      );
    }

    res.json({ profile: profiles[0] });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// Update user preferences
const updatePreferences = async (req, res) => {
  try {
    const userId = req.userId;
    const { age_min, age_max, height_min, height_max, marital_status, religion, education, occupation, location } = req.body;

    await db.query(
      `UPDATE preferences SET
       age_min = ?, age_max = ?, height_min = ?, height_max = ?,
       marital_status = ?, religion = ?, education = ?, occupation = ?, location = ?
       WHERE user_id = ?`,
      [age_min, age_max, height_min, height_max, marital_status, religion, education, occupation, location, userId]
    );

    res.json({ message: 'Preferences updated successfully' });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
};

// Get user preferences
const getPreferences = async (req, res) => {
  try {
    const [preferences] = await db.query(
      'SELECT * FROM preferences WHERE user_id = ?',
      [req.userId]
    );

    res.json({ preferences: preferences[0] || {} });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
};

module.exports = {
  updateProfile,
  getProfileById,
  updatePreferences,
  getPreferences
};
