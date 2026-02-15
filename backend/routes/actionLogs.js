const express = require('express');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

/**
 * GET /api/action-logs
 * Get recent action logs for all user's social accounts
 */
router.get('/', async (req, res) => {
    const { limit = 50, offset = 0, status, actionType } = req.query;

    try {
        let query = `
      SELECT al.*, sa.username, sa.platform, c.name as campaign_name
      FROM action_logs al
      JOIN social_accounts sa ON al.social_account_id = sa.id
      LEFT JOIN campaigns c ON al.campaign_id = c.id
      WHERE sa.user_id = $1
    `;
        const params = [req.user.userId];
        let paramIndex = 2;

        if (status) {
            query += ` AND al.status = $${paramIndex++}`;
            params.push(status);
        }
        if (actionType) {
            query += ` AND al.action_type = $${paramIndex++}`;
            params.push(actionType);
        }

        query += ` ORDER BY al.executed_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
        params.push(parseInt(limit), parseInt(offset));

        const result = await db.query(query, params);

        // Get summary stats
        const stats = await db.query(
            `SELECT 
         COUNT(*) as total,
         COUNT(CASE WHEN al.status = 'success' THEN 1 END) as successful,
         COUNT(CASE WHEN al.status = 'failed' THEN 1 END) as failed,
         COUNT(CASE WHEN al.executed_at > NOW() - INTERVAL '24 hours' THEN 1 END) as last_24h
       FROM action_logs al
       JOIN social_accounts sa ON al.social_account_id = sa.id
       WHERE sa.user_id = $1`,
            [req.user.userId]
        );

        res.json({
            logs: result.rows,
            stats: stats.rows[0],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
    } catch (error) {
        console.error('Get action logs error:', error);
        res.status(500).json({ error: { message: 'Failed to fetch action logs', status: 500 } });
    }
});

/**
 * GET /api/action-logs/campaign/:campaignId
 * Get action logs for a specific campaign
 */
router.get('/campaign/:campaignId', async (req, res) => {
    const { campaignId } = req.params;
    const { limit = 50 } = req.query;

    try {
        // Verify campaign belongs to user
        const campaignCheck = await db.query(
            'SELECT id FROM campaigns WHERE id = $1 AND user_id = $2',
            [campaignId, req.user.userId]
        );

        if (campaignCheck.rows.length === 0) {
            return res.status(404).json({ error: { message: 'Campaign not found', status: 404 } });
        }

        const result = await db.query(
            `SELECT al.*, sa.username, sa.platform, l.name as lead_name
       FROM action_logs al
       JOIN social_accounts sa ON al.social_account_id = sa.id
       LEFT JOIN leads l ON al.lead_id = l.id
       WHERE al.campaign_id = $1
       ORDER BY al.executed_at DESC
       LIMIT $2`,
            [campaignId, parseInt(limit)]
        );

        res.json({ logs: result.rows });
    } catch (error) {
        console.error('Get campaign action logs error:', error);
        res.status(500).json({ error: { message: 'Failed to fetch action logs', status: 500 } });
    }
});

module.exports = router;
