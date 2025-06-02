const express = require('express');
const authMiddleware = require('../middleware/auth.middleware'); // Assuming you have an auth middleware
const { getStreamToken } = require('../controllers/chat.controller'); // Import the controller function
const router = express.Router();

// Example route: GET /chat
router.get('/token', authMiddleware.authUser, getStreamToken);

module.exports = router;