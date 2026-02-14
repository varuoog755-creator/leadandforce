const { Pool } = require('pg');

const connectionString = 'postgresql://neondb_owner:npg_cK4hbZ7Hyvqi@ep-super-field-ai9emlcx-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Connection error:', err.stack);
    } else {
        console.log('✅ Connection successful. Server time:', res.rows[0].now);
    }
    pool.end();
});
