'use strict';
const router = require('express').Router();
router.use(require('express').json());
const pool = require('../db/pool');
const requireAuth = require('./middleware');

// ── GET /api/counterparties ───────────────────────────────────────────────────
router.get('/', requireAuth, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT c.*, u.display_name as created_by_name,
                    COUNT(w.id)::int as wallet_count
             FROM counterparties c
             LEFT JOIN users u ON u.id = c.created_by
             LEFT JOIN counterparty_wallets w ON w.counterparty_id = c.id
             WHERE c.org_id=$1
             GROUP BY c.id, u.display_name
             ORDER BY c.name ASC`,
            [req.user.org_id]
        );
        res.json({ counterparties: result.rows });
    } catch (err) {
        console.error('Get counterparties error:', err);
        res.status(500).json({ error: 'Failed to fetch counterparties' });
    }
});

// ── GET /api/counterparties/:id ───────────────────────────────────────────────
router.get('/:id', requireAuth, async (req, res) => {
    try {
        const cpRes = await pool.query(
            `SELECT c.*, u.display_name as created_by_name
             FROM counterparties c
             LEFT JOIN users u ON u.id = c.created_by
             WHERE c.id=$1 AND c.org_id=$2`,
            [req.params.id, req.user.org_id]
        );
        if (cpRes.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        const walletsRes = await pool.query(
            `SELECT * FROM counterparty_wallets WHERE counterparty_id=$1 ORDER BY created_at ASC`,
            [req.params.id]
        );
        res.json({ counterparty: cpRes.rows[0], wallets: walletsRes.rows });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch counterparty' });
    }
});

// ── POST /api/counterparties ──────────────────────────────────────────────────
router.post('/', requireAuth, async (req, res) => {
    if (!req.user.is_owner) {
        return res.status(403).json({ error: 'Only the org owner can add counterparties' });
    }
    const { name, email, notes } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    try {
        const result = await pool.query(
            `INSERT INTO counterparties (org_id, name, email, notes, created_by)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [req.user.org_id, name, email || null, notes || null, req.user.id]
        );
        res.status(201).json({ counterparty: result.rows[0] });
    } catch (err) {
        console.error('Create counterparty error:', err);
        res.status(500).json({ error: 'Failed to create counterparty' });
    }
});

// ── PUT /api/counterparties/:id ───────────────────────────────────────────────
router.put('/:id', requireAuth, async (req, res) => {
    if (!req.user.is_owner) {
        return res.status(403).json({ error: 'Only the org owner can edit counterparties' });
    }
    const { name, email, notes, active } = req.body;
    try {
        const result = await pool.query(
            `UPDATE counterparties SET
                name    = COALESCE($1, name),
                email   = COALESCE($2, email),
                notes   = COALESCE($3, notes),
                active  = COALESCE($4, active)
             WHERE id=$5 AND org_id=$6 RETURNING *`,
            [name || null, email || null, notes || null,
             active !== undefined ? active : null,
             req.params.id, req.user.org_id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json({ counterparty: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update counterparty' });
    }
});

// ── POST /api/counterparties/:id/wallets ──────────────────────────────────────
router.post('/:id/wallets', requireAuth, async (req, res) => {
    if (!req.user.is_owner) {
        return res.status(403).json({ error: 'Only the org owner can add wallets' });
    }
    const { public_key, label } = req.body;
    if (!public_key) return res.status(400).json({ error: 'public_key is required' });
    try {
        // Verify counterparty belongs to org
        const cpCheck = await pool.query(
            'SELECT id FROM counterparties WHERE id=$1 AND org_id=$2',
            [req.params.id, req.user.org_id]
        );
        if (cpCheck.rows.length === 0) return res.status(404).json({ error: 'Counterparty not found' });
        const result = await pool.query(
            `INSERT INTO counterparty_wallets (counterparty_id, org_id, public_key, label)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [req.params.id, req.user.org_id, public_key, label || null]
        );
        res.status(201).json({ wallet: result.rows[0] });
    } catch (err) {
        if (err.code === '23505') return res.status(409).json({ error: 'Wallet already added to this counterparty' });
        res.status(500).json({ error: 'Failed to add wallet' });
    }
});

// ── DELETE /api/counterparties/:id/wallets/:wid ───────────────────────────────
router.delete('/:id/wallets/:wid', requireAuth, async (req, res) => {
    if (!req.user.is_owner) {
        return res.status(403).json({ error: 'Only the org owner can remove wallets' });
    }
    try {
        await pool.query(
            `DELETE FROM counterparty_wallets WHERE id=$1 AND counterparty_id=$2 AND org_id=$3`,
            [req.params.wid, req.params.id, req.user.org_id]
        );
        res.json({ message: 'Wallet removed' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to remove wallet' });
    }
});

module.exports = router;
