'use strict';
const router = require('express').Router();
const express = require('express');
router.use(express.json({ strict: false }));
router.use(express.urlencoded({ extended: true }));
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');
const pool = require('../db/pool');
const mailer = require('../lib/mailer');

const SALT_ROUNDS = 12;
const TOKEN_EXPIRY = '12h';

// ── POST /api/auth/register ──────────────────────────────────────────────────
// First user for an org becomes compliance_officer and creates the org
router.post('/register', async (req, res) => {
    const { org_name, email, password, display_name } = req.body;
    if (!org_name || !email || !password) {
        return res.status(400).json({ error: 'org_name, email and password are required' });
    }
    if (password.length < 10) {
        return res.status(400).json({ error: 'Password must be at least 10 characters' });
    }
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Check email not already taken
        const existing = await client.query('SELECT id FROM users WHERE email=$1', [email.toLowerCase()]);
        if (existing.rows.length > 0) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        // Create org
        const slug = org_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        const orgRes = await client.query(
            'INSERT INTO orgs (name, slug) VALUES ($1, $2) RETURNING id',
            [org_name, slug + '-' + Date.now()]
        );
        const org_id = orgRes.rows[0].id;

        // Create user
        const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
        const verify_token = crypto.randomBytes(32).toString('hex');
        const userRes = await client.query(
            `INSERT INTO users (org_id, email, password_hash, role, display_name, verify_token)
             VALUES ($1, $2, $3, 'compliance_officer', $4, $5) RETURNING id`,
            [org_id, email.toLowerCase(), password_hash, display_name || null, verify_token]
        );
        const user_id = userRes.rows[0].id;

        await client.query('COMMIT');

        // Send verification email
        const verifyUrl = `${process.env.APP_URL}/desk/verify?token=${verify_token}`;
        await mailer.sendVerification(email, verifyUrl, display_name || email);

        res.status(201).json({
            message: 'Account created. Please verify your email.',
            user_id,
            org_id
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Register error:', err);
        res.status(500).json({ error: 'Registration failed' });
    } finally {
        client.release();
    }
});

// ── POST /api/auth/invite ────────────────────────────────────────────────────
// Compliance officer invites a desk trader to their org
router.post('/invite', require('./middleware'), async (req, res) => {
    if (req.user.role !== 'compliance_officer') {
        return res.status(403).json({ error: 'Only compliance officers can invite users' });
    }
    const { email, display_name, role } = req.body;
    if (!email || !role) {
        return res.status(400).json({ error: 'email and role are required' });
    }
    if (!['compliance_officer','desk_trader'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
    }
    try {
        const existing = await pool.query('SELECT id FROM users WHERE email=$1', [email.toLowerCase()]);
        if (existing.rows.length > 0) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        // Temp password — user must reset on first login
        const temp_password = crypto.randomBytes(10).toString('hex');
        const password_hash = await bcrypt.hash(temp_password, SALT_ROUNDS);
        const verify_token = crypto.randomBytes(32).toString('hex');

        const result = await pool.query(
            `INSERT INTO users (org_id, email, password_hash, role, display_name, verify_token)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
            [req.user.org_id, email.toLowerCase(), password_hash, role, display_name || null, verify_token]
        );

        const verifyUrl = `${process.env.APP_URL}/desk/verify?token=${verify_token}`;
        await mailer.sendInvite(email, verifyUrl, display_name || email, temp_password, req.user.display_name || 'Your organization');

        res.status(201).json({ message: 'Invitation sent', user_id: result.rows[0].id });
    } catch (err) {
        console.error('Invite error:', err);
        res.status(500).json({ error: 'Invite failed' });
    }
});

// ── POST /api/auth/dev-verify ────────────────────────────────────────────────
// DEV ONLY — instantly verifies an account by email, bypassing email token
router.post('/dev-verify', async (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        return res.status(404).json({ error: 'Not found' });
    }
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'email required' });
    try {
        const result = await pool.query(
            `UPDATE users SET email_verified=true, verify_token=NULL
             WHERE email=$1 RETURNING id, email, role`,
            [email.toLowerCase()]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'Email verified', user: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Failed' });
    }
});

// ── POST /api/auth/verify-email ──────────────────────────────────────────────
router.post('/verify-email', async (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Token required' });
    try {
        const result = await pool.query(
            `UPDATE users SET email_verified=true, verify_token=NULL
             WHERE verify_token=$1 AND email_verified=false RETURNING id`,
            [token]
        );
        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid or already used token' });
        }
        res.json({ message: 'Email verified. You can now set up your authenticator.' });
    } catch (err) {
        console.error('Verify email error:', err);
        res.status(500).json({ error: 'Verification failed' });
    }
});

// ── POST /api/auth/totp/setup ────────────────────────────────────────────────
// Returns a QR code URI — user scans with Google Authenticator
router.post('/totp/setup', require('./middleware'), async (req, res) => {
    try {
        const secret = speakeasy.generateSecret({
            name: `xTrader Desk (${req.user.email})`
        });
        // Store secret temporarily (not enabled until confirmed)
        await pool.query(
            'UPDATE users SET totp_secret=$1 WHERE id=$2',
            [secret.base32, req.user.id]
        );
        const qr = await QRCode.toDataURL(secret.otpauth_url);
        res.json({ qr, secret: secret.base32 });
    } catch (err) {
        console.error('TOTP setup error:', err);
        res.status(500).json({ error: 'TOTP setup failed' });
    }
});

// ── POST /api/auth/totp/confirm ──────────────────────────────────────────────
// User submits first code to confirm they've set up the authenticator
router.post('/totp/confirm', require('./middleware'), async (req, res) => {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Code required' });
    try {
        const result = await pool.query('SELECT totp_secret FROM users WHERE id=$1', [req.user.id]);
        const { totp_secret } = result.rows[0];
        const valid = speakeasy.totp.verify({
            secret: totp_secret,
            encoding: 'base32',
            token: code,
            window: 1
        });
        if (!valid) return res.status(400).json({ error: 'Invalid code' });
        await pool.query('UPDATE users SET totp_enabled=true WHERE id=$1', [req.user.id]);
        res.json({ message: 'Authenticator enabled' });
    } catch (err) {
        console.error('TOTP confirm error:', err);
        res.status(500).json({ error: 'TOTP confirmation failed' });
    }
});

// ── POST /api/auth/login ─────────────────────────────────────────────────────
// Step 1: email + password → returns totp_required flag
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }
    try {
        const result = await pool.query(
            `SELECT u.*, o.name as org_name FROM users u
             JOIN orgs o ON o.id = u.org_id
             WHERE u.email=$1 AND u.active=true`,
            [email.toLowerCase()]
        );
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const user = result.rows[0];
        if (!user.email_verified) {
            return res.status(403).json({ error: 'Please verify your email first' });
        }
        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        if (user.totp_enabled) {
            // Issue a short-lived pre-auth token — only valid for TOTP step
            const preToken = jwt.sign(
                { id: user.id, pre_auth: true },
                process.env.JWT_SECRET,
                { expiresIn: '5m' }
            );
            return res.json({ totp_required: true, pre_token: preToken });
        }
        // No TOTP yet — issue full token but flag setup required
        const token = issueToken(user);
        res.json({ token, totp_setup_required: !user.totp_enabled, user: safeUser(user) });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Login failed' });
    }
});

// ── POST /api/auth/login/totp ────────────────────────────────────────────────
// Step 2: submit TOTP code with pre_token → returns full JWT
router.post('/login/totp', async (req, res) => {
    const { pre_token, code } = req.body;
    if (!pre_token || !code) {
        return res.status(400).json({ error: 'pre_token and code required' });
    }
    try {
        let payload;
        try {
            payload = jwt.verify(pre_token, process.env.JWT_SECRET);
        } catch {
            return res.status(401).json({ error: 'Invalid or expired pre-auth token' });
        }
        if (!payload.pre_auth) {
            return res.status(401).json({ error: 'Invalid token type' });
        }
        const result = await pool.query(
            `SELECT u.*, o.name as org_name FROM users u
             JOIN orgs o ON o.id = u.org_id
             WHERE u.id=$1 AND u.active=true`,
            [payload.id]
        );
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'User not found' });
        }
        const user = result.rows[0];
        const valid = speakeasy.totp.verify({
            secret: user.totp_secret,
            encoding: 'base32',
            token: code,
            window: 1
        });
        if (!valid) return res.status(401).json({ error: 'Invalid authenticator code' });
        const token = issueToken(user);
        res.json({ token, user: safeUser(user) });
    } catch (err) {
        console.error('TOTP login error:', err);
        res.status(500).json({ error: 'Login failed' });
    }
});

// ── POST /api/auth/me ────────────────────────────────────────────────────────
router.get('/me', require('./middleware'), async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT u.*, o.name as org_name FROM users u
             JOIN orgs o ON o.id = u.org_id
             WHERE u.id=$1`,
            [req.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json({ user: safeUser(result.rows[0]) });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// ── Helpers ──────────────────────────────────────────────────────────────────
function issueToken(user) {
    return jwt.sign(
        {
            id: user.id,
            org_id: user.org_id,
            email: user.email,
            role: user.role,
            display_name: user.display_name,
            org_name: user.org_name
        },
        process.env.JWT_SECRET,
        { expiresIn: TOKEN_EXPIRY }
    );
}

function safeUser(user) {
    return {
        id: user.id,
        org_id: user.org_id,
        org_name: user.org_name,
        email: user.email,
        role: user.role,
        display_name: user.display_name,
        totp_enabled: user.totp_enabled,
        totp_setup_required: !user.totp_enabled
    };
}

module.exports = router;
