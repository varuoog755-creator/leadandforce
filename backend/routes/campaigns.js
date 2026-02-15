const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * GET /api/campaigns
 * Get all campaigns for the authenticated user
 */
router.get('/', async (req, res) => {
    try {
        const result = await db.query(
            `SELECT c.*, sa.username as account_username, sa.platform as account_platform,
              COUNT(l.id) as total_leads,
              COUNT(CASE WHEN l.status = 'connected' THEN 1 END) as connected_count,
              COUNT(CASE WHEN l.status = 'replied' THEN 1 END) as replied_count
       FROM campaigns c
       LEFT JOIN social_accounts sa ON c.social_account_id = sa.id
       LEFT JOIN leads l ON c.id = l.campaign_id
       WHERE c.user_id = $1
       GROUP BY c.id, sa.username, sa.platform
       ORDER BY c.created_at DESC`,
            [req.user.userId]
        );

        res.json({ campaigns: result.rows });
    } catch (error) {
        console.error('Get campaigns error:', error);
        res.status(500).json({ error: { message: 'Failed to fetch campaigns', status: 500 } });
    }
});

/**
 * POST /api/campaigns
 * Create a new campaign
 */
router.post('/',
    [
        body('name').notEmpty().trim(),
        body('socialAccountId').isUUID(),
        body('platform').isIn(['linkedin', 'instagram', 'facebook']),
        body('actionType').isIn(['connect', 'message', 'like', 'follow', 'comment', 'view_story']),
        body('targetAudienceUrl').optional().isURL(),
        body('dailyLimit').optional().isInt({ min: 1, max: 200 }),
        body('personalizationTemplate').optional().isString()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            name,
            socialAccountId,
            platform,
            actionType,
            targetAudienceUrl,
            dailyLimit = 30,
            personalizationTemplate
        } = req.body;

        try {
            // Verify social account belongs to user
            const accountCheck = await db.query(
                'SELECT id FROM social_accounts WHERE id = $1 AND user_id = $2',
                [socialAccountId, req.user.userId]
            );

            if (accountCheck.rows.length === 0) {
                return res.status(404).json({ error: { message: 'Social account not found', status: 404 } });
            }

            // Create campaign
            const result = await db.query(
                `INSERT INTO campaigns (user_id, social_account_id, name, platform, target_audience_url, action_type, daily_limit, personalization_template)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
                [req.user.userId, socialAccountId, name, platform, targetAudienceUrl, actionType, dailyLimit, personalizationTemplate]
            );

            res.status(201).json({ campaign: result.rows[0] });
        } catch (error) {
            console.error('Create campaign error:', error);
            res.status(500).json({ error: { message: 'Failed to create campaign', status: 500 } });
        }
    }
);

/**
 * PATCH /api/campaigns/:id
 * Update campaign status (pause/resume)
 */
router.patch('/:id',
    [
        body('status').optional().isIn(['active', 'paused', 'completed'])
    ],
    async (req, res) => {
        const { id } = req.params;
        const { status } = req.body;

        try {
            const result = await db.query(
                'UPDATE campaigns SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
                [status, id, req.user.userId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: { message: 'Campaign not found', status: 404 } });
            }

            res.json({ campaign: result.rows[0] });
        } catch (error) {
            console.error('Update campaign error:', error);
            res.status(500).json({ error: { message: 'Failed to update campaign', status: 500 } });
        }
    }
);

/**
 * DELETE /api/campaigns/:id
 * Delete a campaign
 */
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await db.query(
            'DELETE FROM campaigns WHERE id = $1 AND user_id = $2 RETURNING id',
            [id, req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: { message: 'Campaign not found', status: 404 } });
        }

        res.json({ message: 'Campaign deleted successfully' });
    } catch (error) {
        console.error('Delete campaign error:', error);
        res.status(500).json({ error: { message: 'Failed to delete campaign', status: 500 } });
    }
});

module.exports = router;
