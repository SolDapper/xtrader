'use strict';
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL
        ? { rejectUnauthorized: false }
        : false
});

pool.on('error', (err) => {
    console.error('Postgres pool error:', err);
});

module.exports = pool;
