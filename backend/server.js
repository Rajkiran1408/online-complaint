const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Enable CORS with specific options
app.use(cors({
    origin: '*', // For now allow all, or you can use your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true
}));

// Body parser
app.use(express.json());

// Serve uploaded files as static
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route files
const auth = require('./routes/authRoutes');
const complaints = require('./routes/complaintRoutes');

// Mount routers
app.use('/api/auth', auth);
app.use('/api/complaints', complaints);

// Root route
app.get('/', (req, res) => {
    res.send('Online Complaint & Grievance Redressal System API');
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('GLOBAL ERROR:', err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Server Error'
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    // server.close(() => process.exit(1));
});
