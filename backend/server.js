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
const actionLogRoutes = require('./routes/actionLogs');
const oauthRoutes = require('./routes/oauth');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
    origin: '*', // Allow all origins for initial deployment fix
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
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

// Debug logging for Vercel
app.use((req, res, next) => {
    console.log(`[DEBUG] Incoming Request: ${req.method} ${req.url}`);
    console.log(`[DEBUG] Headers: ${JSON.stringify(req.headers['x-forwarded-for'] || req.socket.remoteAddress)}`);
    next();
});

// Health check and Test endpoints
const healthCheck = (req, res) => {
    res.json({ status: 'ok', version: '1.0.1', serverTime: new Date().toISOString(), path: req.url });
};
app.get(['/health', '/api/health', '/api/test'], healthCheck);

// API Routes - Using a more flexible approach for monorepo routing
const apiRoutes = express.Router();
apiRoutes.use('/auth', authRoutes);
apiRoutes.use('/campaigns', campaignRoutes);
apiRoutes.use('/social-accounts', socialAccountRoutes);
apiRoutes.use('/leads', leadRoutes);
apiRoutes.use('/analytics', analyticsRoutes);
apiRoutes.use('/inbox', inboxRoutes);
apiRoutes.use('/action-logs', actionLogRoutes);
apiRoutes.use('/oauth', oauthRoutes);

// Register routes both with and without /api prefix to be safe
app.use('/api', apiRoutes);
app.use('/api', apiRoutes);
app.use('/', apiRoutes);

// Root Debug Handler
app.get('/', (req, res) => {
    res.json({ message: 'Backend is running', version: '1.0.2', env: process.env.NODE_ENV });
});

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

// Only listen if run directly, not when imported as a module (e.g., by Vercel)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 LeadEnforce API running on port ${PORT}`);
        console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    });
}

module.exports = app;
