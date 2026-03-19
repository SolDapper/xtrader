'use strict';
require('dotenv').config();
const pool = require('./pool');

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('Running migration: counterparties...');
        await client.query('BEGIN');

        await client.query(`
            CREATE TABLE IF NOT EXISTS counterparties (
                id          SERIAL PRIMARY KEY,
                org_id      INTEGER NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
                name        VARCHAR(255) NOT NULL,
                email       VARCHAR(255),
                notes       TEXT,
                active      BOOLEAN NOT NULL DEFAULT true,
                created_by  INTEGER REFERENCES users(id) ON DELETE SET NULL,
                created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS counterparty_wallets (
                id                  SERIAL PRIMARY KEY,
                counterparty_id     INTEGER NOT NULL REFERENCES counterparties(id) ON DELETE CASCADE,
                org_id              INTEGER NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
                label               VARCHAR(255),
                public_key          VARCHAR(64) NOT NULL,
                created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                UNIQUE(counterparty_id, public_key)
            );
        `);

        await client.query(`CREATE INDEX IF NOT EXISTS idx_counterparties_org ON counterparties(org_id);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_cp_wallets_cp ON counterparty_wallets(counterparty_id);`);

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
