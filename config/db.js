require('dotenv').config();
const { Pool } = require('pg');

// Banco local (localhost) não usa SSL; o do Render exige.
const ehLocal = /@(localhost|127\.0\.0\.1)[:/]/.test(process.env.DATABASE_URL || '');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: ehLocal ? false : { rejectUnauthorized: false }
});

module.exports = pool;