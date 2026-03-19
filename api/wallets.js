'use strict';
const router = require('express').Router();
const crypto = require('crypto');
const { Keypair } = require('@solana/web3.js');
const bs58 = require('bs58');
const pool = require('../db/pool');
const requireAuth = require('./middleware');

const ALGO = 'aes-256-gcm';

function encryptKey(privateKeyBytes) {
    const keyBuf = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGO, keyBuf, iv);
    const encrypted = Buffer.concat([cipher.update(privateKeyBytes), cipher.final()]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, tag, encrypted]).toString('hex');
}

function decryptKey(encryptedHex) {
    const keyBuf = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
    const data = Buffer.from(encryptedHex, 'hex');
    const iv = data.subarray(0, 16);
    const tag = data.subarray(16, 32);
    const encrypted = data.subarray(32);
    const decipher = crypto.createDecipheriv(ALGO, keyBuf, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}

// ── POST /api/wallets/generate ───────────────────────────────────────────────
// Compliance officer generates a new custodial keypair
router.post('/generate', requireAuth, async (req, res) => {
    if (req.user.role !== 'compliance_officer') {
        return res.status(403).json({ error: 'Only compliance officers can generate wallets' });
    }
    const { label } = req.body;
    if (!label) return res.status(400).json({ error: 'label is required' });
    try {
        const keypair = Keypair.generate();
        const public_key = keypair.publicKey.toString();
        const encrypted_key = encryptKey(Buffer.from(keypair.secretKey));
        const result = await pool.query(
            `INSERT INTO wallets (org_id, label, public_key, encrypted_key)
             VALUES ($1, $2, $3, $4) RETURNING id, label, public_key, approved, created_at`,
            [req.user.org_id, label, public_key, encrypted_key]
        );
        res.status(201).json({ wallet: result.rows[0] });
    } catch (err) {
        console.error('Generate wallet error:', err);
        res.status(500).json({ error: 'Failed to generate wallet' });
    }
});

// ── GET /api/wallets ─────────────────────────────────────────────────────────
router.get('/', requireAuth, async (req, res) => {
    try {
        let query, params;
        if (req.user.role === 'compliance_officer') {
            // Officers see all wallets in their org
            query = `SELECT w.id, w.label, w.public_key, w.approved, w.active,
                            w.created_at, w.approved_at,
                            u.display_name as assigned_to_name, u.id as assigned_to_id
                     FROM wallets w
                     LEFT JOIN users u ON u.id = w.assigned_to
                     WHERE w.org_id=$1
                     ORDER BY w.created_at DESC`;
            params = [req.user.org_id];
        } else {
            // Desk traders only see wallets assigned and approved for them
            query = `SELECT id, label, public_key, approved, active, created_at
                     FROM wallets
                     WHERE org_id=$1 AND assigned_to=$2 AND approved=true AND active=true
                     ORDER BY created_at DESC`;
            params = [req.user.org_id, req.user.id];
        }
        const result = await pool.query(query, params);
        res.json({ wallets: result.rows });
    } catch (err) {
        console.error('Get wallets error:', err);
        res.status(500).json({ error: 'Failed to fetch wallets' });
    }
});

// ── PUT /api/wallets/:id/approve ─────────────────────────────────────────────
router.put('/:id/approve', requireAuth, async (req, res) => {
    if (req.user.role !== 'compliance_officer') {
        return res.status(403).json({ error: 'Only compliance officers can approve wallets' });
    }
    try {
        const result = await pool.query(
            `UPDATE wallets SET approved=true, approved_by=$1, approved_at=NOW()
             WHERE id=$2 AND org_id=$3 RETURNING id, label, public_key, approved`,
            [req.user.id, req.params.id, req.user.org_id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Wallet not found' });
        res.json({ wallet: result.rows[0] });
    } catch (err) {
        console.error('Approve wallet error:', err);
        res.status(500).json({ error: 'Failed to approve wallet' });
    }
});

// ── PUT /api/wallets/:id/assign ──────────────────────────────────────────────
router.put('/:id/assign', requireAuth, async (req, res) => {
    if (req.user.role !== 'compliance_officer') {
        return res.status(403).json({ error: 'Only compliance officers can assign wallets' });
    }
    const { user_id } = req.body;
    try {
        // Verify target user is in same org
        if (user_id) {
            const userCheck = await pool.query(
                'SELECT id FROM users WHERE id=$1 AND org_id=$2',
                [user_id, req.user.org_id]
            );
            if (userCheck.rows.length === 0) return res.status(404).json({ error: 'User not found in org' });
        }
        const result = await pool.query(
            `UPDATE wallets SET assigned_to=$1
             WHERE id=$2 AND org_id=$3 RETURNING id, label, public_key, assigned_to`,
            [user_id || null, req.params.id, req.user.org_id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Wallet not found' });
        res.json({ wallet: result.rows[0] });
    } catch (err) {
        console.error('Assign wallet error:', err);
        res.status(500).json({ error: 'Failed to assign wallet' });
    }
});

// ── PUT /api/wallets/:id/label ───────────────────────────────────────────────
router.put('/:id/label', requireAuth, async (req, res) => {
    if (req.user.role !== 'compliance_officer') {
        return res.status(403).json({ error: 'Only compliance officers can rename wallets' });
    }
    const { label } = req.body;
    if (!label) return res.status(400).json({ error: 'label is required' });
    try {
        const result = await pool.query(
            `UPDATE wallets SET label=$1 WHERE id=$2 AND org_id=$3
             RETURNING id, label, public_key`,
            [label, req.params.id, req.user.org_id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Wallet not found' });
        res.json({ wallet: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update label' });
    }
});

// Export decryptKey for use in trades API
module.exports = router;
module.exports.decryptKey = decryptKey;
