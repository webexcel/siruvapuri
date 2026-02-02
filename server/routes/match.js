const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const auth = require('../middleware/auth');

// Public route - no authentication required
router.get('/public-search', matchController.publicSearchProfiles);

// Protected routes - require authentication
router.use(auth);

router.get('/recommendations', matchController.getDailyRecommendations);
router.get('/top-matches', matchController.getTopMatches);
router.get('/search', matchController.searchProfiles);
router.post('/interest/send', matchController.sendInterest);
router.get('/interest/received', matchController.getReceivedInterests);
router.get('/interest/sent', matchController.getSentInterests);
router.put('/interest/respond', matchController.respondToInterest);

module.exports = router;
