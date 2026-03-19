'use strict';
const router = require('express').Router();
const pool = require('../db/pool');
const requireAuth = require('./middleware');

// ── GET /api/orgs/me ─────────────────────────────────────────────────────────
router.get('/me', requireAuth, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM orgs WHERE id=$1', [req.user.org_id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Org not found' });
        res.json({ org: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch org' });
    }
});

// ── PUT /api/orgs/me ─────────────────────────────────────────────────────────
router.put('/me', requireAuth, async (req, res) => {
    if (req.user.role !== 'compliance_officer') {
        return res.status(403).json({ error: 'Only compliance officers can update org details' });
    }
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    try {
        const result = await pool.query(
            'UPDATE orgs SET name=$1 WHERE id=$2 RETURNING *',
            [name, req.user.org_id]
        );
        res.json({ org: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update org' });
    }
});

module.exports = router;
