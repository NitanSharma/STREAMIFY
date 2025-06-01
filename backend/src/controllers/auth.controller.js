const User = require('../models/User.model'); // Assuming you have a User model defined
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { upsertStreamUser } = require('../db/stream');


exports.signup = async (req, res) => {  
try {
    const { fullName, email, password } = req.body;

    // Simple validation
    if (!fullName || !email || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    // Check if user already exists (assuming you have a User model)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(409).json({ message: 'User already exists.' });
    }

    const idx = Math.floor(Math.random() * 100);
    const profilePic = `https://avatar.iran.liara.run/public/${idx}.png`;

    // Create new user
    const user = new User({
        fullName,
        email,
        password,
        profilePic : profilePic,
    });


    try{
        await upsertStreamUser({
        id: user._id.toString(),
        name: user.fullName,
        image: user.profilePic || '',
        });
        console.log('Stream user upserted successfully');
    }catch (error) {
        console.error('Error upserting Stream user:', error);
        return res.status(500).json({ message: 'Error creating user in Stream.' });
    }
   

    await user.save();

    const token = jwt.sign({ userId: user._id },process.env.JWT_SECRET, { expiresIn: '1h' });

    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        maxAge: 3600000 , // 1 hour in milliseconds
        sameSite: 'strict' // Helps prevent CSRF attacks
    });
    res.status(201).json({ message: 'User registered successfully.' , user : user , token  });
} catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
}
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Simple validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Compare password using bcrypt
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000,
            sameSite: 'strict'
        });
        res.status(200).json({ message: 'Login successful.'});
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};

exports.logout = (req, res) => {  
    res.clearCookie('token');
    res.status(200).json({ message: 'Logout successful.' });
};

exports.onboarding = async (req, res) => {
   try{
    const userId = req.user._id; // Assuming user ID is available in req.user
    const {fullName, bio, nativeLanguage, learningLanguage, location} = req.body;

    // Simple validation
    if (!fullName || !bio || !nativeLanguage || !learningLanguage || !location) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, {
        ...req.body,
        isOnboarded: true,
    } , { new: true });
    
    if (!updatedUser) {
        return res.status(404).json({ message: 'User not found.' });
    }

    //Update Stream user
    try {
        await upsertStreamUser({
            id: updatedUser._id.toString(),
            name: updatedUser.fullName,
            image: updatedUser.profilePic || '',
        });
        console.log('Stream user upserted successfully');
    } catch (error) {
        console.error('Error upserting Stream user:', error);
        return res.status(500).json({ message: 'Error updating user in Stream.' });
    }

    res.status(200).json({ message: 'Onboarding completed successfully.', user: updatedUser });

   }catch (error) {
       res.status(500).json({ message: 'Server error.', error: error.message });
   }
}

exports.getProfile = async (req, res) => {
    try {
        const userId = req.user._id; // Assuming user ID is available in req.user

        // Find user by ID
        const user = await User.findById(userId).select('-password'); // Exclude password from response
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};