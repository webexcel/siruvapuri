const db = require('../config/database');
const { deleteFromS3 } = require('../config/s3');

// Update profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const profileData = req.body;

    // All allowed profile fields based on the matrimonial form
    const allowedFields = [
      // Primary Information
      'full_name', 'date_of_birth', 'birth_place',

      // Physical Attributes
      'height', 'weight', 'complexion', 'blood_group', 'physical_status',

      // Background
      'marital_status', 'religion', 'caste', 'sub_caste', 'mother_tongue',

      // Education & Career
      'education', 'education_detail', 'occupation', 'company_name', 'working_place',
      'annual_income', 'monthly_income',

      // Horoscope Details
      'time_of_birth', 'rasi', 'nakshatra', 'lagnam', 'kothram', 'dosham', 'matching_stars',

      // Family Information
      'father_name', 'father_occupation', 'father_status',
      'mother_name', 'mother_occupation', 'mother_status',
      'brothers_count', 'brothers_married', 'sisters_count', 'sisters_married',
      'family_type', 'family_status', 'own_house', 'native_place',

      // Contact & Address
      'address', 'city', 'state', 'country', 'pincode',

      // Alliance Expectations
      'expected_age_min', 'expected_age_max', 'expected_qualification',
      'expected_location', 'expected_income',

      // About
      'about_me', 'looking_for', 'hobbies',

      // Other
      'profile_picture', 'created_by'
    ];

    const updateFields = [];
    const updateValues = [];

    allowedFields.forEach(field => {
      if (profileData[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        // Convert empty strings to null for numeric fields
        const numericFields = ['brothers_count', 'brothers_married', 'sisters_count', 'sisters_married',
          'expected_age_min', 'expected_age_max'];
        if (numericFields.includes(field) && profileData[field] === '') {
          updateValues.push(null);
        } else {
          updateValues.push(profileData[field]);
        }
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

    // Also update user table fields if provided (phone, age)
    const userFields = [];
    const userValues = [];

    if (profileData.phone !== undefined) {
      userFields.push('phone = ?');
      userValues.push(profileData.phone);
    }
    if (profileData.age !== undefined) {
      userFields.push('age = ?');
      userValues.push(profileData.age);
    }

    if (userFields.length > 0) {
      userValues.push(userId);
      await db.query(
        `UPDATE users SET ${userFields.join(', ')} WHERE id = ?`,
        userValues
      );
    }

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
              CONCAT(u.first_name, COALESCE(CONCAT(' ', u.middle_name), ''), ' ', u.last_name) as full_name,
              u.first_name, u.middle_name, u.last_name,
              u.gender, u.age, u.email, u.phone,
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
      [profileId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Record profile view (don't fail if this errors)
    if (viewerId && viewerId !== profileId) {
      try {
        await db.query(
          'INSERT INTO profile_views (viewer_id, viewed_id) VALUES (?, ?)',
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
    const result = await db.query(
      'SELECT * FROM preferences WHERE user_id = ?',
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
       WHERE viewed_id = ?`,
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
      'SELECT profile_picture FROM profiles WHERE user_id = ?',
      [userId]
    );

    if (oldPicResult.rows.length > 0 && oldPicResult.rows[0].profile_picture) {
      await deleteFromS3(oldPicResult.rows[0].profile_picture);
    }

    // Update profile with new picture URL
    await db.query(
      'UPDATE profiles SET profile_picture = ? WHERE user_id = ?',
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
