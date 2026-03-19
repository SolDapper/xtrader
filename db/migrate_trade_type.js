'use strict';
require('dotenv').config();
const pool = require('./pool');

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('Running migration: add trade_type to trades...');
        await client.query('BEGIN');
        await client.query(`
            ALTER TABLE trades
            ADD COLUMN IF NOT EXISTS trade_type VARCHAR(20) NOT NULL DEFAULT 'otc'
            CHECK (trade_type IN ('otc', 'market'));
        `);
        await client.query('COMMIT');
        console.log('Migration complete.');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', err);
        throw err;
    } finally {
        client.release();
        await pool.end();
    }
}

migrate().catch(() => process.exit(1));
