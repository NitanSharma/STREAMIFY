const express = require('express');
const router = express.Router();
const { getRecommendedUsers, getMyFriends , sendFriendRequest , acceptFriendRequest , getFriendRequests,  getOutgoingFriendReqs} = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');

// apply authentication middleware to all routes in this router
router.use(authMiddleware.authUser);

router.get('/', getRecommendedUsers);
router.get('/friends', getMyFriends);

router.post('/friend-request/:id', sendFriendRequest);
router.put("/friend-request/:id/accept", acceptFriendRequest); 

router.get('/friend-request', getFriendRequests); // Assuming you have a function to get friend requests
router.get('/outgoing-friend-requests', getOutgoingFriendReqs); // Assuming you have a function to get outgoing friend requests

module.exports = router;