require('dotenv').config();
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

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
