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
            `SELECT m.*, sa.platform, sa.username as account_username
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

/**
 * GET /api/inbox/stats
 * Get inbox statistics (unread count, total count)
 */
router.get('/stats', async (req, res) => {
    try {
        const result = await db.query(
            `SELECT 
         COUNT(*) as total_messages,
         COUNT(CASE WHEN m.is_read = false AND m.is_outbound = false THEN 1 END) as unread_count
       FROM messages m
       JOIN social_accounts sa ON m.social_account_id = sa.id
       WHERE sa.user_id = $1`,
            [req.user.userId]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Get inbox stats error:', error);
        res.status(500).json({ error: { message: 'Failed to fetch inbox stats', status: 500 } });
    }
});

/**
 * GET /api/inbox/thread/:threadId
 * Get all messages in a thread
 */
router.get('/thread/:threadId', async (req, res) => {
    try {
        const result = await db.query(
            `SELECT m.*, sa.platform, sa.username as account_username
       FROM messages m
       JOIN social_accounts sa ON m.social_account_id = sa.id
       WHERE sa.user_id = $1 AND m.thread_id = $2
       ORDER BY m.created_at ASC`,
            [req.user.userId, req.params.threadId]
        );

        res.json({ messages: result.rows });
    } catch (error) {
        console.error('Get thread error:', error);
        res.status(500).json({ error: { message: 'Failed to fetch thread', status: 500 } });
    }
});

/**
 * POST /api/inbox/reply
 * Send a reply to a message thread
 */
router.post('/reply', async (req, res) => {
    const { threadId, socialAccountId, messageText } = req.body;

    if (!threadId || !socialAccountId || !messageText) {
        return res.status(400).json({ error: { message: 'threadId, socialAccountId, and messageText are required', status: 400 } });
    }

    try {
        // Verify the social account belongs to the user
        const accountCheck = await db.query(
            'SELECT id, platform FROM social_accounts WHERE id = $1 AND user_id = $2',
            [socialAccountId, req.user.userId]
        );

        if (accountCheck.rows.length === 0) {
            return res.status(404).json({ error: { message: 'Social account not found', status: 404 } });
        }

        const platform = accountCheck.rows[0].platform;

        // Insert the reply message
        const result = await db.query(
            `INSERT INTO messages (social_account_id, platform, message_text, is_outbound, is_read, thread_id, sender_name)
       VALUES ($1, $2, $3, true, true, $4, 'You')
       RETURNING *`,
            [socialAccountId, platform, messageText, threadId]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Reply error:', error);
        res.status(500).json({ error: { message: 'Failed to send reply', status: 500 } });
    }
});

/**
 * PATCH /api/inbox/:id/read
 * Mark a message as read
 */
router.patch('/:id/read', async (req, res) => {
    try {
        // Verify message belongs to user
        const result = await db.query(
            `UPDATE messages m SET is_read = true
       FROM social_accounts sa
       WHERE m.social_account_id = sa.id AND sa.user_id = $1 AND m.id = $2
       RETURNING m.*`,
            [req.user.userId, req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: { message: 'Message not found', status: 404 } });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Mark read error:', error);
        res.status(500).json({ error: { message: 'Failed to mark message as read', status: 500 } });
    }
});

/**
 * PATCH /api/inbox/thread/:threadId/read
 * Mark all messages in a thread as read
 */
router.patch('/thread/:threadId/read', async (req, res) => {
    try {
        await db.query(
            `UPDATE messages m SET is_read = true
       FROM social_accounts sa
       WHERE m.social_account_id = sa.id AND sa.user_id = $1 AND m.thread_id = $2`,
            [req.user.userId, req.params.threadId]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Mark thread read error:', error);
        res.status(500).json({ error: { message: 'Failed to mark thread as read', status: 500 } });
    }
});

module.exports = router;
