'use strict';
require('dotenv').config();
const pool = require('./pool');

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('Running migrations...');
        await client.query('BEGIN');

        // ── Organizations ────────────────────────────────────────────────────
        await client.query(`
            CREATE TABLE IF NOT EXISTS orgs (
                id          SERIAL PRIMARY KEY,
                name        VARCHAR(255) NOT NULL,
                slug        VARCHAR(100) NOT NULL UNIQUE,
                active      BOOLEAN NOT NULL DEFAULT true,
                created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        `);

        // ── Users ────────────────────────────────────────────────────────────
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id              SERIAL PRIMARY KEY,
                org_id          INTEGER NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
                email           VARCHAR(255) NOT NULL UNIQUE,
                password_hash   VARCHAR(255) NOT NULL,
                role            VARCHAR(50) NOT NULL CHECK (role IN ('compliance_officer','desk_trader')),
                display_name    VARCHAR(255),
                totp_secret     VARCHAR(255),
                totp_enabled    BOOLEAN NOT NULL DEFAULT false,
                email_verified  BOOLEAN NOT NULL DEFAULT false,
                verify_token    VARCHAR(255),
                reset_token     VARCHAR(255),
                reset_expires   TIMESTAMPTZ,
                active          BOOLEAN NOT NULL DEFAULT true,
                created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        `);

        // ── Custodial wallets ────────────────────────────────────────────────
        await client.query(`
            CREATE TABLE IF NOT EXISTS wallets (
                id              SERIAL PRIMARY KEY,
                org_id          INTEGER NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
                label           VARCHAR(255) NOT NULL,
                public_key      VARCHAR(64) NOT NULL UNIQUE,
                encrypted_key   TEXT NOT NULL,
                assigned_to     INTEGER REFERENCES users(id) ON DELETE SET NULL,
                approved        BOOLEAN NOT NULL DEFAULT false,
                approved_by     INTEGER REFERENCES users(id) ON DELETE SET NULL,
                approved_at     TIMESTAMPTZ,
                active          BOOLEAN NOT NULL DEFAULT true,
                created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        `);

        // ── Trade proposals ──────────────────────────────────────────────────
        await client.query(`
            CREATE TABLE IF NOT EXISTS trades (
                id              SERIAL PRIMARY KEY,
                org_id          INTEGER NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
                proposed_by     INTEGER NOT NULL REFERENCES users(id),
                wallet_id       INTEGER NOT NULL REFERENCES wallets(id),
                status          VARCHAR(50) NOT NULL DEFAULT 'pending'
                                    CHECK (status IN ('pending','approved','rejected','executed','failed')),
                token1_mint     VARCHAR(64) NOT NULL,
                token1_symbol   VARCHAR(50),
                token1_amount   VARCHAR(50) NOT NULL,
                token2_mint     VARCHAR(64),
                token2_symbol   VARCHAR(50),
                token2_amount   VARCHAR(50),
                token3_mint     VARCHAR(64) NOT NULL,
                token3_symbol   VARCHAR(50),
                token3_amount   VARCHAR(50) NOT NULL,
                token4_mint     VARCHAR(64),
                token4_symbol   VARCHAR(50),
                token4_amount   VARCHAR(50),
                buyer_wallet    VARCHAR(64),
                memo            TEXT,
                review_note     TEXT,
                reviewed_by     INTEGER REFERENCES users(id),
                reviewed_at     TIMESTAMPTZ,
                tx_signature    VARCHAR(128),
                executed_at     TIMESTAMPTZ,
                created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        `);

        // ── Indexes ──────────────────────────────────────────────────────────
        await client.query(`CREATE INDEX IF NOT EXISTS idx_users_org     ON users(org_id);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_wallets_org   ON wallets(org_id);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_trades_org    ON trades(org_id);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_trades_status ON trades(status);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_trades_user   ON trades(proposed_by);`);

        await client.query('COMMIT');
        console.log('Migrations complete.');
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
