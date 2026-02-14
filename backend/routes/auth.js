const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { generateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register',
    [
        body('email').isEmail().normalizeEmail(),
        body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            // Check if user already exists
            const existingUser = await db.query('SELECT id FROM users WHERE email = $1', [email]);
            if (existingUser.rows.length > 0) {
                return res.status(409).json({ error: { message: 'Email already registered', status: 409 } });
            }

            // Hash password
            const passwordHash = await bcrypt.hash(password, 10);

            // Generate API key
            const apiKey = require('crypto').randomBytes(32).toString('hex');

            // Insert user
            const result = await db.query(
                'INSERT INTO users (email, password_hash, api_key) VALUES ($1, $2, $3) RETURNING id, email, subscription_plan, created_at',
                [email, passwordHash, apiKey]
            );

            const user = result.rows[0];
            const token = generateToken(user.id, user.email);

            res.status(201).json({
                user: {
                    id: user.id,
                    email: user.email,
                    subscriptionPlan: user.subscription_plan,
                    createdAt: user.created_at
                },
                token,
                apiKey
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ error: { message: 'Registration failed', status: 500 } });
        }
    }
);

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login',
    [
        body('email').isEmail().normalizeEmail(),
        body('password').notEmpty()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            // Find user
            const result = await db.query(
                'SELECT id, email, password_hash, subscription_plan, api_key FROM users WHERE email = $1',
                [email]
            );

            if (result.rows.length === 0) {
                return res.status(401).json({ error: { message: 'Invalid credentials', status: 401 } });
            }

            const user = result.rows[0];

            // Verify password
            const isValidPassword = await bcrypt.compare(password, user.password_hash);
            if (!isValidPassword) {
                return res.status(401).json({ error: { message: 'Invalid credentials', status: 401 } });
            }

            const token = generateToken(user.id, user.email);

            res.json({
                user: {
                    id: user.id,
                    email: user.email,
                    subscriptionPlan: user.subscription_plan
                },
                token,
                apiKey: user.api_key
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: { message: 'Login failed', status: 500 } });
        }
    }
);

module.exports = router;
