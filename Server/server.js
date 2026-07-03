const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Allows us to accept JSON data in the body

// Add the Auth Routes here
app.use('/uploads', express.static('uploads'));
app.use('/api/auth', authRoutes); // ADD THIS
app.use('/api/complaints', complaintRoutes);

// Basic test route
app.get('/', (req, res) => {
  res.send('FixIt API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in development mode on port ${PORT}`);
});