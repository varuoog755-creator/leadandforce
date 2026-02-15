const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' }); // Try loading from parent if not in current
require('dotenv').config(); // Try loading from current

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('Beginning migration...');

        // Add auth_method column
        await client.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='social_accounts' AND column_name='auth_method') THEN
                    ALTER TABLE social_accounts ADD COLUMN auth_method VARCHAR(50) DEFAULT 'password';
                END IF;
            END
            $$;
        `);
        console.log('Added auth_method column');

        // Add oauth_provider column
        await client.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='social_accounts' AND column_name='oauth_provider') THEN
                    ALTER TABLE social_accounts ADD COLUMN oauth_provider VARCHAR(50);
                END IF;
            END
            $$;
        `);
        console.log('Added oauth_provider column');

        // Add provider_account_id column
        await client.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='social_accounts' AND column_name='provider_account_id') THEN
                    ALTER TABLE social_accounts ADD COLUMN provider_account_id VARCHAR(255);
                END IF;
            END
            $$;
        `);
        console.log('Added provider_account_id column');

        // Add access_token column
        await client.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='social_accounts' AND column_name='access_token') THEN
                    ALTER TABLE social_accounts ADD COLUMN access_token TEXT;
                END IF;
            END
            $$;
        `);
        console.log('Added access_token column');

        // Add refresh_token column
        await client.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='social_accounts' AND column_name='refresh_token') THEN
                    ALTER TABLE social_accounts ADD COLUMN refresh_token TEXT;
                END IF;
            END
            $$;
        `);
        console.log('Added refresh_token column');

        // Add token_expires_at column
        await client.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='social_accounts' AND column_name='token_expires_at') THEN
                    ALTER TABLE social_accounts ADD COLUMN token_expires_at TIMESTAMP;
                END IF;
            END
            $$;
        `);
        console.log('Added token_expires_at column');

        console.log('Migration completed successfully');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
