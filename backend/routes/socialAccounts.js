const express = require('express');
const { body, validationResult } = require('express-validator');
const CryptoJS = require('crypto-js');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

const ENCRYPTION_KEY = process.env.JWT_SECRET;

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
 * GET /api/social-accounts/:id/stats
 * Get detailed stats for a specific social account
 */
router.get('/:id/stats', async (req, res) => {
    const { id } = req.params;

    try {
        // Verify account belongs to user
        const accountCheck = await db.query(
            'SELECT id, platform, username, status, daily_action_count, warmup_day, last_action_at, created_at FROM social_accounts WHERE id = $1 AND user_id = $2',
            [id, req.user.userId]
        );

        if (accountCheck.rows.length === 0) {
            return res.status(404).json({ error: { message: 'Account not found', status: 404 } });
        }

        // Get action stats
        const actionStats = await db.query(
            `SELECT 
         COUNT(*) as total_actions,
         COUNT(CASE WHEN status = 'success' THEN 1 END) as successful,
         COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
         COUNT(CASE WHEN executed_at > NOW() - INTERVAL '24 hours' THEN 1 END) as last_24h,
         AVG(execution_time_ms) as avg_execution_time
       FROM action_logs WHERE social_account_id = $1`,
            [id]
        );

        // Get campaign count
        const campaignCount = await db.query(
            'SELECT COUNT(*) as count FROM campaigns WHERE social_account_id = $1',
            [id]
        );

        res.json({
            account: accountCheck.rows[0],
            stats: {
                ...actionStats.rows[0],
                campaign_count: parseInt(campaignCount.rows[0].count)
            }
        });
    } catch (error) {
        console.error('Get account stats error:', error);
        res.status(500).json({ error: { message: 'Failed to fetch account stats', status: 500 } });
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
            const encryptedCredentials = CryptoJS.AES.encrypt(password, ENCRYPTION_KEY).toString();

            const result = await db.query(
                `INSERT INTO social_accounts (user_id, platform, username, encrypted_credentials, status, proxy_ip, proxy_port)
         VALUES ($1, $2, $3, $4, 'warming_up', $5, $6)
         RETURNING id, platform, username, status, proxy_ip, warmup_day, created_at`,
                [req.user.userId, platform, username, encryptedCredentials, proxyIp, proxyPort]
            );

            res.status(201).json({ account: result.rows[0] });
        } catch (error) {
            if (error.code === '23505') {
                return res.status(409).json({ error: { message: 'Account already exists', status: 409 } });
            }
            console.error('Add social account error:', error);
            res.status(500).json({ error: { message: 'Failed to add account', status: 500 } });
        }
    }
);

/**
 * PATCH /api/social-accounts/:id
 * Update a social account (status, proxy)
 */
router.patch('/:id', async (req, res) => {
    const { id } = req.params;
    const { status, proxyIp, proxyPort } = req.body;

    try {
        // Build dynamic update
        const updates = [];
        const params = [];
        let paramIndex = 1;

        if (status) {
            const validStatuses = ['active', 'paused', 'warming_up', 'error'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ error: { message: `Status must be one of: ${validStatuses.join(', ')}`, status: 400 } });
            }
            updates.push(`status = $${paramIndex++}`);
            params.push(status);
        }
        if (proxyIp !== undefined) {
            updates.push(`proxy_ip = $${paramIndex++}`);
            params.push(proxyIp);
        }
        if (proxyPort !== undefined) {
            updates.push(`proxy_port = $${paramIndex++}`);
            params.push(proxyPort);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: { message: 'No valid fields to update', status: 400 } });
        }

        params.push(id, req.user.userId);
        const result = await db.query(
            `UPDATE social_accounts SET ${updates.join(', ')}
       WHERE id = $${paramIndex++} AND user_id = $${paramIndex++}
       RETURNING id, platform, username, status, proxy_ip, proxy_port, warmup_day, daily_action_count, last_action_at`,
            params
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: { message: 'Account not found', status: 404 } });
        }

        res.json({ account: result.rows[0] });
    } catch (error) {
        console.error('Update social account error:', error);
        res.status(500).json({ error: { message: 'Failed to update account', status: 500 } });
    }
});

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
