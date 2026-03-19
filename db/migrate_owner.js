'use strict';
require('dotenv').config();
const pool = require('./pool');

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('Running migration: add is_owner to users...');
        await client.query('BEGIN');
        await client.query(`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS is_owner BOOLEAN NOT NULL DEFAULT false;
        `);
        // The first compliance_officer in each org is the owner
        await client.query(`
            UPDATE users u
            SET is_owner = true
            WHERE u.role = 'compliance_officer'
            AND u.id = (
                SELECT id FROM users
                WHERE org_id = u.org_id
                ORDER BY created_at ASC
                LIMIT 1
            );
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
