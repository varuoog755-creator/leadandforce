const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const campaignRoutes = require('./routes/campaigns');
const socialAccountRoutes = require('./routes/socialAccounts');
const leadRoutes = require('./routes/leads');
const analyticsRoutes = require('./routes/analytics');
const inboxRoutes = require('./routes/inbox');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
    origin: true,
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get(['/health', '/api/health'], (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use(['/auth', '/api/auth'], authRoutes);
app.use(['/campaigns', '/api/campaigns'], campaignRoutes);
app.use(['/social-accounts', '/api/social-accounts'], socialAccountRoutes);
app.use(['/leads', '/api/leads'], leadRoutes);
app.use(['/analytics', '/api/analytics'], analyticsRoutes);
app.use(['/inbox', '/api/inbox'], inboxRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Internal Server Error',
            status: err.status || 500
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: {
            message: `Route not found: ${req.url}`,
            status: 404
        }
    });
});

app.listen(PORT, () => {
    console.log(`🚀 LeadEnforce API running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;
