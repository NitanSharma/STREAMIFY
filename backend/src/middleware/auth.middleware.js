const jwt = require('jsonwebtoken');
const userModel = require('../models/User.model');

module.exports.authUser = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    // console.log('Token:', token); // Debugging line to check the token value
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
   
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // console.log('Decoded Token:', decoded); // Debugging line to check the decoded token
        const user = await userModel.findById(decoded.userId).select('-password -__v'); // Exclude password and version field
        // console.log('User from token:', user); // Debugging line to check the user fetched from token
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        req.user = user;
        return next();        
    } catch (error) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
}