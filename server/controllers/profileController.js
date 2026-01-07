const db = require('../config/database');
const { deleteFromS3 } = require('../config/s3');

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

    let paramIndex = 1;
    allowedFields.forEach(field => {
      if (profileData[field] !== undefined) {
        updateFields.push(`${field} = $${paramIndex}`);
        updateValues.push(profileData[field]);
        paramIndex++;
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    updateValues.push(userId);

    await db.query(
      `UPDATE profiles SET ${updateFields.join(', ')} WHERE user_id = $${paramIndex}`,
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

    // Validate ID is a number
    const profileId = parseInt(id);
    if (isNaN(profileId)) {
      return res.status(400).json({ error: 'Invalid profile ID' });
    }

    const result = await db.query(
      `SELECT u.id,
              u.first_name || COALESCE(' ' || u.middle_name, '') || ' ' || u.last_name as full_name,
              u.first_name, u.middle_name, u.last_name,
              u.gender, u.age, u.email, u.phone,
              u.membership_type, u.membership_expiry,
              CASE
                WHEN u.membership_expiry IS NOT NULL AND u.membership_expiry > NOW() THEN true
                ELSE false
              END as is_membership_active,
              p.height, p.weight, p.marital_status, p.religion, p.caste, p.mother_tongue,
              p.education, p.occupation, p.annual_income, p.city, p.state, p.country,
              p.about_me, p.profile_picture, p.looking_for, p.hobbies, p.created_by
       FROM users u
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE u.id = $1`,
      [profileId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Record profile view (don't fail if this errors)
    if (viewerId && viewerId !== profileId) {
      try {
        await db.query(
          'INSERT INTO profile_views (viewer_id, viewed_id) VALUES ($1, $2)',
          [viewerId, profileId]
        );
      } catch (viewError) {
        // Log but don't fail the request - profile views table might have issues
        console.error('Error recording profile view:', viewError.message);
      }
    }

    res.json({ profile: result.rows[0] });
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
       age_min = $1, age_max = $2, height_min = $3, height_max = $4,
       marital_status = $5, religion = $6, education = $7, occupation = $8, location = $9
       WHERE user_id = $10`,
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
    const result = await db.query(
      'SELECT * FROM preferences WHERE user_id = $1',
      [req.userId]
    );

    res.json({ preferences: result.rows[0] || {} });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
};

// Get profile views count for the current user
const getProfileViewsCount = async (req, res) => {
  try {
    const userId = req.userId;

    // Get the count of users who have viewed the current user's profile
    const result = await db.query(
      `SELECT COUNT(DISTINCT viewer_id) as view_count
       FROM profile_views
       WHERE viewed_id = $1`,
      [userId]
    );

    res.json({
      viewCount: parseInt(result.rows[0]?.view_count || 0)
    });
  } catch (error) {
    console.error('Get profile views count error:', error);
    res.status(500).json({ error: 'Failed to fetch profile views count' });
  }
};

// Upload profile picture
const uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.userId;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const imageUrl = req.file.location;

    // Get old profile picture URL to delete from S3
    const oldPicResult = await db.query(
      'SELECT profile_picture FROM profiles WHERE user_id = $1',
      [userId]
    );

    if (oldPicResult.rows.length > 0 && oldPicResult.rows[0].profile_picture) {
      await deleteFromS3(oldPicResult.rows[0].profile_picture);
    }

    // Update profile with new picture URL
    await db.query(
      'UPDATE profiles SET profile_picture = $1 WHERE user_id = $2',
      [imageUrl, userId]
    );

    res.json({
      message: 'Profile picture uploaded successfully',
      profile_picture: imageUrl
    });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({ error: 'Failed to upload profile picture' });
  }
};

module.exports = {
  updateProfile,
  getProfileById,
  updatePreferences,
  getPreferences,
  getProfileViewsCount,
  uploadProfilePicture
};
