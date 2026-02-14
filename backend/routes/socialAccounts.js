const express = require('express');
const { body, validationResult } = require('express-validator');
const CryptoJS = require('crypto-js');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

const ENCRYPTION_KEY = process.env.JWT_SECRET; // Use JWT secret for encryption

/**
 * GET /api/social-accounts
 * Get all social accounts for the authenticated user
 */
router.get('/', async (req, res) => {
    try {
        const result = await db.query(
            `SELECT id, platform, username, status, proxy_ip, last_action_at, daily_action_count, warmup_day, created_at
       FROM social_accounts WHERE user_id = $1 ORDER BY created_at DESC`,
            [req.user.userId]
        );

        res.json({ accounts: result.rows });
    } catch (error) {
        console.error('Get social accounts error:', error);
        res.status(500).json({ error: { message: 'Failed to fetch accounts', status: 500 } });
    }
});

/**
 * POST /api/social-accounts
 * Add a new social account
 */
router.post('/',
    [
        body('platform').isIn(['linkedin', 'instagram', 'facebook']),
        body('username').notEmpty().trim(),
        body('password').notEmpty(),
        body('proxyIp').optional().isIP(),
        body('proxyPort').optional().isInt()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { platform, username, password, proxyIp, proxyPort } = req.body;

        try {
            // Encrypt password
            const encryptedCredentials = CryptoJS.AES.encrypt(password, ENCRYPTION_KEY).toString();

            // Insert account with warming_up status
            const result = await db.query(
                `INSERT INTO social_accounts (user_id, platform, username, encrypted_credentials, status, proxy_ip, proxy_port)
         VALUES ($1, $2, $3, $4, 'warming_up', $5, $6)
         RETURNING id, platform, username, status, proxy_ip, warmup_day, created_at`,
                [req.user.userId, platform, username, encryptedCredentials, proxyIp, proxyPort]
            );

            res.status(201).json({ account: result.rows[0] });
        } catch (error) {
            if (error.code === '23505') { // Unique constraint violation
                return res.status(409).json({ error: { message: 'Account already exists', status: 409 } });
            }
            console.error('Add social account error:', error);
            res.status(500).json({ error: { message: 'Failed to add account', status: 500 } });
        }
    }
);

/**
 * DELETE /api/social-accounts/:id
 * Remove a social account
 */
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await db.query(
            'DELETE FROM social_accounts WHERE id = $1 AND user_id = $2 RETURNING id',
            [id, req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: { message: 'Account not found', status: 404 } });
        }

        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Delete social account error:', error);
        res.status(500).json({ error: { message: 'Failed to delete account', status: 500 } });
    }
});

module.exports = router;
