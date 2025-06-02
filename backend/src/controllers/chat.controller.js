const { generateStreamToken } = require("../db/stream");


const getStreamToken = async (req, res) => {
    try { 
        const token = generateStreamToken(req.user.id);
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate token' });
    }
};

module.exports = { getStreamToken };