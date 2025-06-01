const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authUser } = require('../middleware/auth.middleware');

router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.post('/logout', authController.logout);

router.post('/onboarding', authUser , authController.onboarding);

router.get('/me', authUser, authController.getProfile);  

module.exports = router;