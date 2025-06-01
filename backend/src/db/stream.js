const dotenv = require('dotenv');
dotenv.config();
const { StreamChat } = require('stream-chat');

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
    throw new Error('STREAM_API_KEY and STREAM_API_SECRET must be set in the environment variables');
}

const streamClient = new StreamChat(apiKey, apiSecret); 

module.exports.upsertStreamUser = async (userData) => {
    try {
        await streamClient.upsertUsers([userData]);
        return userData;
    } catch (error) {
        console.error('Error upserting Stream user:', error);
        throw error;
    }
};

module.exports.generateStreamToken = (userId) => {
    try {
        const token = streamClient.createToken(userId);
        return token;
    } catch (error) {
        console.error('Error generating Stream token:', error);
        throw error;
    }
};
