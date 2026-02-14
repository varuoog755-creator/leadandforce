const express = require('express');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

/**
 * GET /api/analytics/dashboard
 * Get dashboard analytics for the authenticated user
 */
router.get('/dashboard', async (req, res) => {
    try {
        // Get campaign stats
        const campaignStats = await db.query(
            `SELECT 
        COUNT(DISTINCT c.id) as total_campaigns,
        COUNT(DISTINCT CASE WHEN c.status = 'active' THEN c.id END) as active_campaigns,
        COUNT(l.id) as total_leads,
        COUNT(CASE WHEN l.status = 'connected' THEN 1 END) as connected_leads,
        COUNT(CASE WHEN l.status = 'replied' THEN 1 END) as replied_leads,
        COUNT(CASE WHEN l.status = 'converted' THEN 1 END) as converted_leads
       FROM campaigns c
       LEFT JOIN leads l ON c.id = l.campaign_id
       WHERE c.user_id = $1`,
            [req.user.userId]
        );

        // Get action stats for today
        const todayStats = await db.query(
            `SELECT 
        COUNT(*) as total_actions,
        COUNT(CASE WHEN status = 'success' THEN 1 END) as successful_actions,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_actions
       FROM action_logs al
       JOIN social_accounts sa ON al.social_account_id = sa.id
       WHERE sa.user_id = $1 AND DATE(al.executed_at) = CURRENT_DATE`,
            [req.user.userId]
        );

        // Calculate conversion rates
        const stats = campaignStats.rows[0];
        const acceptanceRate = stats.total_leads > 0
            ? ((stats.connected_leads / stats.total_leads) * 100).toFixed(2)
            : 0;
        const replyRate = stats.connected_leads > 0
            ? ((stats.replied_leads / stats.connected_leads) * 100).toFixed(2)
            : 0;
        const conversionRate = stats.total_leads > 0
            ? ((stats.converted_leads / stats.total_leads) * 100).toFixed(2)
            : 0;

        res.json({
            campaigns: {
                total: parseInt(stats.total_campaigns),
                active: parseInt(stats.active_campaigns)
            },
            leads: {
                total: parseInt(stats.total_leads),
                connected: parseInt(stats.connected_leads),
                replied: parseInt(stats.replied_leads),
                converted: parseInt(stats.converted_leads)
            },
            rates: {
                acceptance: parseFloat(acceptanceRate),
                reply: parseFloat(replyRate),
                conversion: parseFloat(conversionRate)
            },
            today: todayStats.rows[0]
        });
    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({ error: { message: 'Failed to fetch analytics', status: 500 } });
    }
});

module.exports = router;
