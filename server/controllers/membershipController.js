const db = require('../config/database');

// Get all membership plans
const getMembershipPlans = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM membership_plans ORDER BY price ASC'
    );

    res.json({
      success: true,
      plans: result.rows
    });
  } catch (error) {
    console.error('Get membership plans error:', error);
    res.status(500).json({ error: 'Failed to fetch membership plans' });
  }
};

// Create a new membership plan
const createMembershipPlan = async (req, res) => {
  try {
    const { name, price, duration_months, features, color, profile_views_limit } = req.body;

    // Check if plan with same name exists
    const existingPlan = await db.query(
      'SELECT id FROM membership_plans WHERE LOWER(name) = LOWER(?)',
      [name]
    );

    if (existingPlan.rows.length > 0) {
      return res.status(400).json({ error: 'A plan with this name already exists' });
    }

    // profile_views_limit: null means unlimited, number means limited
    const viewsLimit = profile_views_limit === '' || profile_views_limit === undefined || profile_views_limit === null ? null : parseInt(profile_views_limit);

    const result = await db.query(
      `INSERT INTO membership_plans (name, price, duration_months, profile_views_limit, features, color, is_active)
       VALUES (?, ?, ?, ?, ?, ?, true)`,
      [name, price, duration_months, viewsLimit, JSON.stringify(features || []), color || 'from-gray-400 to-gray-600']
    );

    // Get the inserted plan
    const insertedPlan = await db.query('SELECT * FROM membership_plans WHERE id = ?', [result.rows.insertId]);

    res.json({
      success: true,
      message: 'Membership plan created successfully',
      plan: insertedPlan.rows[0]
    });
  } catch (error) {
    console.error('Create membership plan error:', error);
    res.status(500).json({ error: 'Failed to create membership plan' });
  }
};

// Update a membership plan
const updateMembershipPlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const { name, price, duration_months, features, color, profile_views_limit } = req.body;

    // Check if plan exists
    const existingPlan = await db.query(
      'SELECT id FROM membership_plans WHERE id = ?',
      [planId]
    );

    if (existingPlan.rows.length === 0) {
      return res.status(404).json({ error: 'Membership plan not found' });
    }

    // Check if another plan with same name exists
    const duplicateName = await db.query(
      'SELECT id FROM membership_plans WHERE LOWER(name) = LOWER(?) AND id != ?',
      [name, planId]
    );

    if (duplicateName.rows.length > 0) {
      return res.status(400).json({ error: 'A plan with this name already exists' });
    }

    // profile_views_limit: null means unlimited, number means limited
    const viewsLimit = profile_views_limit === '' || profile_views_limit === undefined || profile_views_limit === null ? null : parseInt(profile_views_limit);

    await db.query(
      `UPDATE membership_plans SET
        name = ?,
        price = ?,
        duration_months = ?,
        profile_views_limit = ?,
        features = ?,
        color = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, price, duration_months, viewsLimit, JSON.stringify(features || []), color, planId]
    );

    const updatedPlan = await db.query('SELECT * FROM membership_plans WHERE id = ?', [planId]);

    res.json({
      success: true,
      message: 'Membership plan updated successfully',
      plan: updatedPlan.rows[0]
    });
  } catch (error) {
    console.error('Update membership plan error:', error);
    res.status(500).json({ error: 'Failed to update membership plan' });
  }
};

// Toggle plan active status
const toggleMembershipPlan = async (req, res) => {
  try {
    const { planId } = req.params;

    await db.query(
      `UPDATE membership_plans SET
        is_active = NOT is_active,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [planId]
    );

    const result = await db.query('SELECT * FROM membership_plans WHERE id = ?', [planId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Membership plan not found' });
    }

    res.json({
      success: true,
      message: `Plan ${result.rows[0].is_active ? 'activated' : 'deactivated'} successfully`,
      plan: result.rows[0]
    });
  } catch (error) {
    console.error('Toggle membership plan error:', error);
    res.status(500).json({ error: 'Failed to toggle membership plan' });
  }
};

// Delete a membership plan
const deleteMembershipPlan = async (req, res) => {
  try {
    const { planId } = req.params;

    const result = await db.query('SELECT * FROM membership_plans WHERE id = ?', [planId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Membership plan not found' });
    }

    await db.query('DELETE FROM membership_plans WHERE id = ?', [planId]);

    res.json({
      success: true,
      message: 'Membership plan deleted successfully'
    });
  } catch (error) {
    console.error('Delete membership plan error:', error);
    res.status(500).json({ error: 'Failed to delete membership plan' });
  }
};

// Get user's profile view stats
const getUserProfileViewStats = async (req, res) => {
  try {
    const userId = req.userId || req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get user's membership info
    const userResult = await db.query(
      `SELECT u.membership_type, u.membership_expiry, mp.profile_views_limit, mp.duration_months
       FROM users u
       LEFT JOIN membership_plans mp ON LOWER(mp.name) = LOWER(u.membership_type) AND mp.is_active = true
       WHERE u.id = ?`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Check if membership is active
    const isMembershipActive = user.membership_type && user.membership_expiry && new Date(user.membership_expiry) > new Date();

    if (!isMembershipActive) {
      return res.json({
        success: true,
        hasActiveMembership: false,
        profileViewsLimit: 0,
        profileViewsUsed: 0,
        profileViewsRemaining: 0,
        isUnlimited: false
      });
    }

    // If profile_views_limit is null, it could mean:
    // 1. Unlimited plan (intended null)
    // 2. No matching plan found (join failed)
    // Check if we actually found a matching plan by looking at duration_months
    const planFound = user.duration_months !== null;

    // If no matching plan found, try to find it with a separate query
    if (!planFound && user.membership_type) {
      const planResult = await db.query(
        `SELECT profile_views_limit, duration_months FROM membership_plans
         WHERE LOWER(name) = LOWER(?) AND is_active = true`,
        [user.membership_type]
      );

      if (planResult.rows.length > 0) {
        user.profile_views_limit = planResult.rows[0].profile_views_limit;
        user.duration_months = planResult.rows[0].duration_months;
      }
    }

    // If still no plan found, return default limit (not unlimited)
    if (user.profile_views_limit === undefined && user.duration_months === null) {
      return res.json({
        success: true,
        hasActiveMembership: true,
        membershipType: user.membership_type,
        profileViewsLimit: 50, // Default limit
        profileViewsUsed: 0,
        profileViewsRemaining: 50,
        isUnlimited: false
      });
    }

    // Calculate membership start date
    const membershipStartDate = user.duration_months
      ? new Date(new Date(user.membership_expiry) - (user.duration_months * 30 * 24 * 60 * 60 * 1000))
      : new Date(0); // If no duration, count all views

    // Count profile views by this user during their membership period
    const viewsResult = await db.query(
      `SELECT COUNT(DISTINCT viewed_id) as views_count
       FROM profile_views
       WHERE viewer_id = ?
       AND viewed_at >= ?`,
      [userId, membershipStartDate]
    );

    const viewsUsed = parseInt(viewsResult.rows[0]?.views_count || 0);
    const viewsLimit = user.profile_views_limit;
    const isUnlimited = viewsLimit === null;

    res.json({
      success: true,
      hasActiveMembership: true,
      membershipType: user.membership_type,
      profileViewsLimit: isUnlimited ? null : viewsLimit,
      profileViewsUsed: viewsUsed,
      profileViewsRemaining: isUnlimited ? null : Math.max(0, viewsLimit - viewsUsed),
      isUnlimited
    });
  } catch (error) {
    console.error('Get profile view stats error:', error);
    res.status(500).json({ error: 'Failed to fetch profile view stats' });
  }
};

// Check if user can view a profile
const checkProfileViewLimit = async (req, res) => {
  try {
    const userId = req.userId || req.user?.id;
    const { profileId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Allow viewing own profile
    if (parseInt(profileId) === userId) {
      return res.json({
        success: true,
        canView: true,
        isOwnProfile: true
      });
    }

    // Get user's membership info
    const userResult = await db.query(
      `SELECT u.membership_type, u.membership_expiry, mp.profile_views_limit, mp.duration_months
       FROM users u
       LEFT JOIN membership_plans mp ON LOWER(mp.name) = LOWER(u.membership_type) AND mp.is_active = true
       WHERE u.id = ?`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Check if membership is active
    const isMembershipActive = user.membership_type && user.membership_expiry && new Date(user.membership_expiry) > new Date();

    if (!isMembershipActive) {
      return res.json({
        success: true,
        canView: false,
        reason: 'no_membership',
        message: 'You need an active membership to view profiles'
      });
    }

    // Check if user has already viewed this profile
    const existingView = await db.query(
      'SELECT id FROM profile_views WHERE viewer_id = ? AND viewed_id = ?',
      [userId, profileId]
    );

    if (existingView.rows.length > 0) {
      // Already viewed, allow viewing again
      return res.json({
        success: true,
        canView: true,
        alreadyViewed: true
      });
    }

    // If unlimited (null), allow
    if (user.profile_views_limit === null) {
      return res.json({
        success: true,
        canView: true,
        isUnlimited: true
      });
    }

    // If no plan found but has membership, use default limit
    const viewsLimit = user.profile_views_limit !== undefined ? user.profile_views_limit : 50;

    // Calculate membership start date
    const membershipStartDate = user.duration_months
      ? new Date(new Date(user.membership_expiry) - (user.duration_months * 30 * 24 * 60 * 60 * 1000))
      : new Date(0);

    // Count profile views during membership period
    const viewsResult = await db.query(
      `SELECT COUNT(DISTINCT viewed_id) as views_count
       FROM profile_views
       WHERE viewer_id = ?
       AND viewed_at >= ?`,
      [userId, membershipStartDate]
    );

    const viewsUsed = parseInt(viewsResult.rows[0]?.views_count || 0);

    if (viewsUsed >= viewsLimit) {
      return res.json({
        success: true,
        canView: false,
        reason: 'limit_reached',
        message: `You have reached your profile view limit of ${viewsLimit}. Please upgrade your membership to view more profiles.`,
        viewsUsed,
        viewsLimit
      });
    }

    return res.json({
      success: true,
      canView: true,
      viewsUsed,
      viewsLimit: user.profile_views_limit,
      viewsRemaining: user.profile_views_limit - viewsUsed - 1
    });
  } catch (error) {
    console.error('Check profile view limit error:', error);
    res.status(500).json({ error: 'Failed to check profile view limit' });
  }
};

module.exports = {
  getMembershipPlans,
  createMembershipPlan,
  updateMembershipPlan,
  deleteMembershipPlan,
  toggleMembershipPlan,
  getUserProfileViewStats,
  checkProfileViewLimit
};
