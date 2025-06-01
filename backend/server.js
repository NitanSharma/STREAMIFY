const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const authRoutes = require('./src/routes/auth.route'); 
const connectToDB = require('./src/db/db'); 
const cookieParser = require('cookie-parser');


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth' , authRoutes);

app.get('/', (req, res) => {
    res.send('Welcome to Streamify Backend!');
});

app.listen(PORT, () => {
    connectToDB();
    console.log(`Server is running on port ${PORT}`);
});