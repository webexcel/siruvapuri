const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const auth = require('../middleware/auth');
const { validateProfile, handleValidationErrors } = require('../middleware/validation');

// All routes require authentication
router.use(auth);

router.put('/update', validateProfile, handleValidationErrors, profileController.updateProfile);
router.get('/:id', profileController.getProfileById);
router.put('/preferences', profileController.updatePreferences);
router.get('/preferences/get', profileController.getPreferences);

module.exports = router;
