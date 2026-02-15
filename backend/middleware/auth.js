const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'leadenforce_super_secret_fallback_123';

/**
 * Middleware to verify JWT token and authenticate requests
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: { message: 'Access token required', status: 401 } });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: { message: 'Invalid or expired token', status: 403 } });
        }
        req.user = user;
        next();
    });
}

/**
 * Generate JWT token for user
 */
function generateToken(userId, email) {
    return jwt.sign(
        { userId, email },
        JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRY || '7d' }
    );
}

module.exports = {
    authenticateToken,
    generateToken
};
