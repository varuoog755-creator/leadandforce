const express = require('express');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

/**
 * GET /api/inbox
 * Get all messages across all platforms
 */
router.get('/', async (req, res) => {
    try {
        const result = await db.query(
            `SELECT m.*, sa.platform, sa.username
       FROM messages m
       JOIN social_accounts sa ON m.social_account_id = sa.id
       WHERE sa.user_id = $1
       ORDER BY m.created_at DESC
       LIMIT 100`,
            [req.user.userId]
        );

        res.json({ messages: result.rows });
    } catch (error) {
        console.error('Get inbox error:', error);
        res.status(500).json({ error: { message: 'Failed to fetch messages', status: 500 } });
    }
});

module.exports = router;
