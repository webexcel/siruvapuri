const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/adminController');
const auth = require('../middleware/auth');
const { upload } = require('../config/s3');

// Admin login (no auth required)
router.post('/login', adminLogin);

// All routes below require admin authentication
router.use(auth);

// Dashboard
router.get('/dashboard', getDashboardStats);

// User Management
router.get('/users', getAllUsers);
router.get('/users/paid-no-password', getPaidUsersWithoutPassword);
router.get('/users/approved', getApprovedUsers);
router.get('/users/with-passwords', getUsersWithPasswords);
router.post('/users/create', createUser);
router.post('/users/bulk-create', bulkCreateUsers);
router.patch('/users/:userId/payment', updatePaymentStatus);
router.patch('/users/:userId/approval', updateApprovalStatus);
router.patch('/users/:userId/update', updateUserData);
router.post('/users/:userId/set-password', setUserPassword);
router.post('/users/:userId/assign-membership', assignMembership); // Dynamically controlled by superadmin module settings
router.post('/users/:userId/revoke-membership', revokeMembership); // Dynamically controlled by superadmin module settings
router.get('/users/:userId/full', getFullUserProfile);
router.put('/users/:userId/full', updateFullUserProfile);
router.post('/users/:userId/upload-photo', upload.single('photo'), uploadUserPhoto);
router.delete('/users/:userId', deleteUser);

// Match Management
router.get('/matches', getAllMatches);
router.post('/matches/create', createMatch);
router.delete('/matches/:matchId', deleteMatch);

// Interest Management
router.get('/interests', getAllInterests);
router.get('/interests/user/:userId', getInterestsByUser);

// Membership Plans Management - Dynamically controlled by superadmin module settings
const {
  getMembershipPlans,
  createMembershipPlan,
  updateMembershipPlan,
  deleteMembershipPlan,
  toggleMembershipPlan
} = require('../controllers/membershipController');

router.get('/membership-plans', getMembershipPlans);
router.post('/membership-plans', createMembershipPlan);
router.put('/membership-plans/:planId', updateMembershipPlan);
router.patch('/membership-plans/:planId/toggle', toggleMembershipPlan);
router.delete('/membership-plans/:planId', deleteMembershipPlan);

// Settings Management
const {
  getThemeSettings,
  updateThemeSettings,
  getAllSettings,
  updateSetting,
  getSidebarSettings,
  updateSidebarSettings,
  getColumnSettings,
  updateColumnSettings,
  getModuleSettings,
  updateModuleSettings
} = require('../controllers/settingsController');

router.get('/settings', getAllSettings);
router.get('/settings/theme', getThemeSettings);
router.put('/settings/theme', updateThemeSettings);
router.get('/settings/sidebar', getSidebarSettings);
router.put('/settings/sidebar', updateSidebarSettings);
router.get('/settings/columns', getColumnSettings);
router.put('/settings/columns', updateColumnSettings);
router.get('/settings/modules', getModuleSettings);
router.put('/settings/modules', updateModuleSettings);
router.put('/settings/:key', updateSetting);

module.exports = router;
