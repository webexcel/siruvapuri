const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

router.get('/recommendations', matchController.getDailyRecommendations);
router.get('/search', matchController.searchProfiles);
router.post('/interest/send', matchController.sendInterest);
router.get('/interest/received', matchController.getReceivedInterests);
router.get('/interest/sent', matchController.getSentInterests);
router.put('/interest/respond', matchController.respondToInterest);

module.exports = router;
