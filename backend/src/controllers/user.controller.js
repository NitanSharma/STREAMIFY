const User = require('../models/User.model');
const FriendRequest = require('../models/FriendRequest.model');
// Get recommended users (example: users who are not friends yet)
const getRecommendedUsers = async (req, res) => {
    try{
        const currentUserId = req.user._id; // Assuming user ID is stored in req.user
        // Fetch users who are not the current user and not friends with the current user
        const currentUser = req.user
        const recommendedUsers = await User.find({
           $and:[
                { _id: { $ne: currentUserId }}, // Exclude current user
                { $id: { $nin: currentUser.friends }}, // Exclude users who are already friends
                {isOnboarded: true} // Only include users who are onboarded
            ]
           
        })
        if (recommendedUsers.length === 0) {
            return res.status(404).json({ message: 'No recommended users found' });
        }
        res.status(200).json({
            message: 'Recommended users fetched successfully',
            data: recommendedUsers
        });
    }catch (error) {
        console.error('Error fetching recommended users:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Get my friends
const getMyFriends = async (req, res) => {
   try {
        const currentUserId = req.user._id; // Assuming user ID is stored in req.user
        // Fetch the current user's friends
        const currentUser = await User.findById(currentUserId).select("friends")
        .populate('friends', "fullName profilePic nativeLanguage learningLanguage");
        
        if (!currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: 'Friends fetched successfully',
            data: currentUser.friends
        });
    }
    catch (error) {
        console.error('Error fetching friends:', error);
        return res.status(500).json({ message: 'Internal server error' });
}}


const sendFriendRequest = async (req, res) => {
    try{
        const currentUserId = req.user._id; // Assuming user ID is stored in req.user
        const recipientId = req.params.id; // Get the recipient ID from the request parameters

        if (currentUserId === recipientId) {
            return res.status(400).json({ message: 'You cannot send a friend request to yourself' });
        }

        // Check if the recipient exists
        const recipient = await User.findById(recipientId);
        if (!recipient) {
            return res.status(404).json({ message: 'Recipient not found' });
        }

        // Check if the recipient is already a friend
        if(recipient.friends.includes(currentUserId)) {
            return res.status(400).json({ message: 'You are already friends with this user' });
        }

        // Check if the friend request already exists
        const existingRequest = await FriendRequest.findOne({
            sender: currentUserId,
            recipient: recipientId,
            status: 'pending'
        });

        if (existingRequest) {
            return res.status(400).json({ message: 'Friend request already sent' });
        }

        // Create a new friend request
        const newFriendRequest = new FriendRequest({
            sender: currentUserId,
            recipient: recipientId,
            status: 'pending'
        });

        await newFriendRequest.save();

        res.status(201).json({
            message: 'Friend request sent successfully',
            data: newFriendRequest
        });
    }catch (error) {
        console.error('Error sending friend request:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Accept friend request (not included in the original code snippet, but useful for completeness)
const acceptFriendRequest = async (req, res) => {
    try {
        const currentUserId = req.user._id; // Assuming user ID is stored in req.user
        const requestId = req.params.id; // Get the request ID from the request parameters
        // Find the friend request
        const friendRequest = await FriendRequest.findById(requestId);

        if (!friendRequest) {
            return res.status(404).json({ message: 'Friend request not found' });
        }
        // Check if the current user is the recipient of the request
        if (friendRequest.recipient.toString() !== currentUserId) {
            return res.status(403).json({ message: 'You are not authorized to accept this friend request' });
         }

        friendRequest.status = 'accepted';
        await friendRequest.save();
            // Add each other to friends list
        await User.findByIdAndUpdate(friendRequest.sender, {
            $addToSet: { friends: friendRequest.recipient }
        });
        await User.findByIdAndUpdate(friendRequest.recipient, {
            $addToSet: { friends: friendRequest.sender }
        });

        res.status(200).json({
            message: 'Friend request accepted successfully',
            data: friendRequest
        });

        }catch (error) {
        console.error('Error accepting friend request:', error);    
        return res.status(500).json({ message: 'Internal server error' });
    }
}

const getFriendRequests = async (req, res) => {
    try {
        const currentUserId = req.user._id;

        // Find friend requests where the current user is the recipient and status is pending
        const friendRequests = await FriendRequest.find({
            recipient: currentUserId,
            status: 'pending'
        }).populate('sender', 'fullName profilePic nativeLanguage learningLanguage');
        
        const acceptedRequests = await FriendRequest.find({
            recipient: currentUserId,
            status: 'accepted'
        }).populate('sender', 'fullName profilePic ');

        res.status(200).json({
            message: 'Friend requests fetched successfully',
            data: friendRequests ,
            acceptedRequests: acceptedRequests
        });
    } catch (error) {
        console.error('Error fetching friend requests:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const getOutgoingFriendReqs = async (req, res) => {
    try {
        const currentUserId = req.user._id;

        // Find friend requests where the current user is the sender and status is pending
        const outgoingRequests = await FriendRequest.find({
            sender: currentUserId,
            status: 'pending'
        }).populate('recipient', 'fullName profilePic nativeLanguage learningLanguage');

        res.status(200).json({
            message: 'Outgoing friend requests fetched successfully',
            data: outgoingRequests
        });
    } catch (error) {
        console.error('Error fetching outgoing friend requests:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    getRecommendedUsers,
    getMyFriends,
    sendFriendRequest,
    acceptFriendRequest,
    getFriendRequests,
    getOutgoingFriendReqs
};