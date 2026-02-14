const express = require('express');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

/**
 * GET /api/leads/:campaignId
 * Get all leads for a specific campaign
 */
router.get('/:campaignId', async (req, res) => {
    const { campaignId } = req.params;

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
            `SELECT * FROM leads WHERE campaign_id = $1 ORDER BY created_at DESC`,
            [campaignId]
        );

        res.json({ leads: result.rows });
    } catch (error) {
        console.error('Get leads error:', error);
        res.status(500).json({ error: { message: 'Failed to fetch leads', status: 500 } });
    }
});

module.exports = router;
