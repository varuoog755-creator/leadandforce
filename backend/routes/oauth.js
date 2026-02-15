const express = require('express');
const axios = require('axios');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Helper to get LinkedIn tokens
async function getLinkedInToken(code) {
    const params = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.LINKEDIN_REDIRECT_URI,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
    });

    const response = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', params, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });

    return response.data;
}

// Helper to get LinkedIn User Profile
async function getLinkedInProfile(accessToken) {
    const response = await axios.get('https://api.linkedin.com/v2/me', {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    return response.data;
}

// Helper to get LinkedIn Email
async function getLinkedInEmail(accessToken) {
    // Note: This endpoint might vary based on permissions "r_emailaddress"
    const response = await axios.get('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    // Safety check for email structure
    if (response.data.elements && response.data.elements.length > 0) {
        return response.data.elements[0]['handle~'].emailAddress;
    }
    return null;
}


/**
 * GET /api/oauth/linkedin/init
 * Initiates the LinkedIn OAuth flow
 */
router.get('/linkedin/init', authenticateToken, (req, res) => {
    const state = req.user.userId; // Pass userId as state to verify on callback (simple version)
    // For better security, state should be a random string stored in Redis/DB associated with the session.
    // However, for this MVP, we'll assume the client handles the flow and we might not need state 
    // if we expect the user to complete the flow in the same browser session where the cookie is present.
    // BUT: The callback endpoint needs to know WHICH user to attach the account to.

    // Important: The callback comes from LinkedIn to our Backend. The browser user context (cookies) might be there?
    // If the browser redirects, cookies are sent. So `authenticateToken` on callback is possible IF the token is in a cookie.
    // BUT our current auth uses `Authorization: Bearer` header, which WON'T be present in a redirect from LinkedIn.

    // SOLUTION: We encode the userId in the `state` parameter.

    const scope = 'w_member_social r_liteprofile r_emailaddress';
    const redirectUri = encodeURIComponent(process.env.LINKEDIN_REDIRECT_URI);
    const clientId = process.env.LINKEDIN_CLIENT_ID;

    const url = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=${scope}`;

    res.json({ url });
});

/**
 * GET /api/oauth/linkedin/callback
 * Handles the callback from LinkedIn
 */
router.get('/linkedin/callback', async (req, res) => {
    const { code, state, error } = req.query;

    if (error) {
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/settings?error=${error}`);
    }

    if (!code || !state) {
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/settings?error=missing_params`);
    }

    const userId = state; // unpacking state

    try {
        // 1. Exchange code for tokens
        const tokenData = await getLinkedInToken(code);
        const { access_token, refresh_token, expires_in } = tokenData;

        // 2. Get Profile Details
        const profile = await getLinkedInProfile(access_token);
        // Only fetch email if you really need it and have permission, skipping for now to reduce failure points if scope issues exist
        // const email = await getLinkedInEmail(access_token); 

        const firstName = profile.localizedFirstName;
        const lastName = profile.localizedLastName;
        const linkedInId = profile.id;
        const fullName = `${firstName} ${lastName}`;

        // 3. Upsert into social_accounts
        // We calculate token expiration
        const expiresAt = new Date(Date.now() + expires_in * 1000);

        const query = `
            INSERT INTO social_accounts 
            (user_id, platform, username, status, auth_method, oauth_provider, provider_account_id, access_token, refresh_token, token_expires_at, created_at)
            VALUES ($1, 'linkedin', $2, 'active', 'oauth', 'linkedin', $3, $4, $5, $6, NOW())
            ON CONFLICT (user_id, platform, username) 
            DO UPDATE SET 
                status = 'active',
                auth_method = 'oauth',
                oauth_provider = 'linkedin',
                provider_account_id = EXCLUDED.provider_account_id,
                access_token = EXCLUDED.access_token,
                refresh_token = EXCLUDED.refresh_token,
                token_expires_at = EXCLUDED.token_expires_at,
                last_action_at = NOW()
            RETURNING id;
        `;

        // Note: The unique constraint on social_accounts might just be (id). 
        // We should check if we have a unique constraint on (user_id, platform, username).
        // If not, we might insert duplicates. For now, assuming we want to allow multiple accounts, 
        // but maybe we should check if this specific LinkedIn ID exists?

        // Better logic: Check if provider_account_id exists for this user.
        const existing = await db.query(
            'SELECT id FROM social_accounts WHERE user_id = $1 AND provider_account_id = $2',
            [userId, linkedInId]
        );

        if (existing.rows.length > 0) {
            // Update
            await db.query(
                `UPDATE social_accounts SET 
                    status = 'active',
                    access_token = $1,
                    refresh_token = $2,
                    token_expires_at = $3,
                    username = $4
                WHERE id = $5`,
                [access_token, refresh_token, expiresAt, fullName, existing.rows[0].id]
            );
        } else {
            // Insert
            await db.query(
                `INSERT INTO social_accounts 
                (user_id, platform, username, status, auth_method, oauth_provider, provider_account_id, access_token, refresh_token, token_expires_at)
                VALUES ($1, 'linkedin', $2, 'active', 'oauth', 'linkedin', $3, $4, $5, $6)`,
                [userId, fullName, linkedInId, access_token, refresh_token, expiresAt]
            );
        }

        // 4. Redirect to Frontend
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/settings?status=success`);

    } catch (err) {
        console.error('LinkedIn OAuth Error:', err.response?.data || err.message);
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/settings?error=oauth_failed`);
    }
});

module.exports = router;
