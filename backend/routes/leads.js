const express = require('express');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

/**
 * GET /api/leads
 * Get all leads across all campaigns for the user
 */
router.get('/', async (req, res) => {
    const { status, platform, search, limit = 100, offset = 0 } = req.query;

    try {
        let query = `
      SELECT l.*, c.name as campaign_name, c.platform
      FROM leads l
      JOIN campaigns c ON l.campaign_id = c.id
      WHERE c.user_id = $1
    `;
        const params = [req.user.userId];
        let paramIndex = 2;

        if (status) {
            query += ` AND l.status = $${paramIndex++}`;
            params.push(status);
        }
        if (platform) {
            query += ` AND c.platform = $${paramIndex++}`;
            params.push(platform);
        }
        if (search) {
            query += ` AND (l.name ILIKE $${paramIndex} OR l.company ILIKE $${paramIndex} OR l.title ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        query += ` ORDER BY l.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
        params.push(parseInt(limit), parseInt(offset));

        const result = await db.query(query, params);

        // Get total count for pagination
        let countQuery = `
      SELECT COUNT(*) as total
      FROM leads l
      JOIN campaigns c ON l.campaign_id = c.id
      WHERE c.user_id = $1
    `;
        const countParams = [req.user.userId];
        let countIndex = 2;
        if (status) {
            countQuery += ` AND l.status = $${countIndex++}`;
            countParams.push(status);
        }
        if (platform) {
            countQuery += ` AND c.platform = $${countIndex++}`;
            countParams.push(platform);
        }
        if (search) {
            countQuery += ` AND (l.name ILIKE $${countIndex} OR l.company ILIKE $${countIndex} OR l.title ILIKE $${countIndex})`;
            countParams.push(`%${search}%`);
        }

        const countResult = await db.query(countQuery, countParams);

        res.json({
            leads: result.rows,
            total: parseInt(countResult.rows[0].total),
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
    } catch (error) {
        console.error('Get all leads error:', error);
        res.status(500).json({ error: { message: 'Failed to fetch leads', status: 500 } });
    }
});

/**
 * GET /api/leads/export
 * Export leads as CSV
 */
router.get('/export', async (req, res) => {
    const { campaignId, status } = req.query;

    try {
        let query = `
      SELECT l.name, l.title, l.company, l.location, l.profile_url, l.status,
             l.last_contacted_at, l.created_at, c.name as campaign_name, c.platform
      FROM leads l
      JOIN campaigns c ON l.campaign_id = c.id
      WHERE c.user_id = $1
    `;
        const params = [req.user.userId];
        let paramIndex = 2;

        if (campaignId) {
            query += ` AND l.campaign_id = $${paramIndex++}`;
            params.push(campaignId);
        }
        if (status) {
            query += ` AND l.status = $${paramIndex++}`;
            params.push(status);
        }

        query += ' ORDER BY l.created_at DESC';
        const result = await db.query(query, params);

        // Generate CSV
        const headers = ['Name', 'Title', 'Company', 'Location', 'Profile URL', 'Status', 'Campaign', 'Platform', 'Last Contacted', 'Created'];
        const csvRows = [headers.join(',')];

        for (const row of result.rows) {
            csvRows.push([
                `"${(row.name || '').replace(/"/g, '""')}"`,
                `"${(row.title || '').replace(/"/g, '""')}"`,
                `"${(row.company || '').replace(/"/g, '""')}"`,
                `"${(row.location || '').replace(/"/g, '""')}"`,
                `"${(row.profile_url || '').replace(/"/g, '""')}"`,
                row.status,
                `"${(row.campaign_name || '').replace(/"/g, '""')}"`,
                row.platform,
                row.last_contacted_at || '',
                row.created_at
            ].join(','));
        }

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=leads-export-${Date.now()}.csv`);
        res.send(csvRows.join('\n'));
    } catch (error) {
        console.error('Export leads error:', error);
        res.status(500).json({ error: { message: 'Failed to export leads', status: 500 } });
    }
});

/**
 * GET /api/leads/:campaignId
 * Get all leads for a specific campaign
 */
router.get('/:campaignId', async (req, res) => {
    const { campaignId } = req.params;

    try {
        // Verify campaign belongs to user
        const campaignCheck = await db.query(
            'SELECT id, name, platform FROM campaigns WHERE id = $1 AND user_id = $2',
            [campaignId, req.user.userId]
        );

        if (campaignCheck.rows.length === 0) {
            return res.status(404).json({ error: { message: 'Campaign not found', status: 404 } });
        }

        const result = await db.query(
            `SELECT * FROM leads WHERE campaign_id = $1 ORDER BY created_at DESC`,
            [campaignId]
        );

        res.json({
            leads: result.rows,
            campaign: campaignCheck.rows[0]
        });
    } catch (error) {
        console.error('Get leads error:', error);
        res.status(500).json({ error: { message: 'Failed to fetch leads', status: 500 } });
    }
});

/**
 * PATCH /api/leads/:id
 * Update a lead's status
 */
router.patch('/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'contacted', 'connected', 'replied', 'converted', 'rejected', 'error'];
    if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ error: { message: `Status must be one of: ${validStatuses.join(', ')}`, status: 400 } });
    }

    try {
        // Verify lead belongs to user through campaign
        const result = await db.query(
            `UPDATE leads l SET status = $1, last_contacted_at = CASE WHEN $1 IN ('contacted', 'connected') THEN CURRENT_TIMESTAMP ELSE l.last_contacted_at END
       FROM campaigns c
       WHERE l.campaign_id = c.id AND c.user_id = $2 AND l.id = $3
       RETURNING l.*`,
            [status, req.user.userId, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: { message: 'Lead not found', status: 404 } });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update lead error:', error);
        res.status(500).json({ error: { message: 'Failed to update lead', status: 500 } });
    }
});

module.exports = router;
