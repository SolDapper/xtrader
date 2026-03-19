'use strict';
const router = require('express').Router();
router.use(require('express').json());
const bcrypt = require('bcrypt');
const pool = require('../db/pool');
const requireAuth = require('./middleware');

const SALT_ROUNDS = 12;

// ── GET /api/users ───────────────────────────────────────────────────────────
router.get('/', requireAuth, async (req, res) => {
    if (req.user.role !== 'compliance_officer') {
        return res.status(403).json({ error: 'Access denied' });
    }
    try {
        const result = await pool.query(
            `SELECT id, email, role, is_owner, display_name, totp_enabled, email_verified, active, created_at
             FROM users WHERE org_id=$1 ORDER BY created_at ASC`,
            [req.user.org_id]
        );
        res.json({ users: result.rows });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// ── PUT /api/users/me/password ───────────────────────────────────────────────
router.put('/me/password', requireAuth, async (req, res) => {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
        return res.status(400).json({ error: 'current_password and new_password required' });
    }
    if (new_password.length < 10) {
        return res.status(400).json({ error: 'Password must be at least 10 characters' });
    }
    try {
        const result = await pool.query('SELECT password_hash FROM users WHERE id=$1', [req.user.id]);
        const valid = await bcrypt.compare(current_password, result.rows[0].password_hash);
        if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });
        const hash = await bcrypt.hash(new_password, SALT_ROUNDS);
        await pool.query('UPDATE users SET password_hash=$1 WHERE id=$2', [hash, req.user.id]);
        res.json({ message: 'Password updated' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update password' });
    }
});

// ── PUT /api/users/:id/active ────────────────────────────────────────────────
// Permission rules:
// - Nobody can deactivate themselves
// - Only owner can deactivate compliance officers
// - Compliance officers can deactivate desk traders
router.put('/:id/active', requireAuth, async (req, res) => {
    if (req.user.role !== 'compliance_officer') {
        return res.status(403).json({ error: 'Access denied' });
    }
    const targetId = parseInt(req.params.id);
    const { active } = req.body;
    if (typeof active !== 'boolean') {
        return res.status(400).json({ error: 'active must be boolean' });
    }
    // Cannot deactivate yourself
    if (targetId === req.user.id) {
        return res.status(403).json({ error: 'You cannot deactivate your own account' });
    }
    try {
        // Fetch target user
        const targetRes = await pool.query(
            'SELECT id, role, is_owner FROM users WHERE id=$1 AND org_id=$2',
            [targetId, req.user.org_id]
        );
        if (targetRes.rows.length === 0) return res.status(404).json({ error: 'User not found' });
        const target = targetRes.rows[0];
        // Cannot deactivate the org owner ever
        if (target.is_owner) {
            return res.status(403).json({ error: 'The org owner account cannot be deactivated' });
        }
        // Only the owner can deactivate other compliance officers
        if (target.role === 'compliance_officer' && !req.user.is_owner) {
            return res.status(403).json({ error: 'Only the org owner can deactivate compliance officers' });
        }
        const result = await pool.query(
            `UPDATE users SET active=$1 WHERE id=$2 AND org_id=$3 RETURNING id, email, active`,
            [active, targetId, req.user.org_id]
        );
        res.json({ user: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update user' });
    }
});

module.exports = router;
