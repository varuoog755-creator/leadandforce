const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function init() {
    const client = await pool.connect();
    try {
        console.log('Checking database state...');

        // Check if users table exists
        const res = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public'
                AND table_name = 'users'
            );
        `);

        if (!res.rows[0].exists) {
            console.log('Tables missing. Initializing database schema...');

            const schemaPath = path.join(__dirname, '../../database/schema.sql');
            if (!fs.existsSync(schemaPath)) {
                throw new Error('Schema file not found at ' + schemaPath);
            }

            const schemaSql = fs.readFileSync(schemaPath, 'utf8');

            // Execute schema
            await client.query(schemaSql);
            console.log('✅ Schema applied successfully.');
        } else {
            console.log('✅ Database already initialized (users table exists).');
        }

    } catch (err) {
        console.error('❌ Initialization failed:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

init();
