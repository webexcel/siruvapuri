const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { getUserProfileViewStats, checkProfileViewLimit } = require('../controllers/membershipController');
const auth = require('../middleware/auth');
const { validateProfile, handleValidationErrors } = require('../middleware/validation');
const { upload } = require('../config/s3');

// All routes require authentication
router.use(auth);

router.put('/update', validateProfile, handleValidationErrors, profileController.updateProfile);
router.post('/upload-photo', (req, res, next) => {
  upload.single('photo')(req, res, (err) => {
    if (err) {
      console.error('Photo upload middleware error:', err.message);
      return res.status(500).json({ error: 'Photo upload failed. Please try again later.' });
    }
    next();
  });
}, profileController.uploadProfilePicture);
router.get('/photo/:id', profileController.downloadProfilePicture);
router.get('/photo-url/:id', profileController.getProfilePictureUrl);
router.put('/preferences', profileController.updatePreferences);
router.get('/preferences/get', profileController.getPreferences);
router.get('/views/count', profileController.getProfileViewsCount);
router.get('/view-stats', getUserProfileViewStats);
router.get('/can-view/:profileId', checkProfileViewLimit);
router.get('/:id', profileController.getProfileById);

module.exports = router;
