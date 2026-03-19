'use strict';
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Security middleware ──────────────────────────────────────────────────────
app.use(helmet({
    contentSecurityPolicy: false // Parcel bundles inline scripts
}));
app.use(cors({
    origin: process.env.ALLOWED_ORIGIN || '*',
    methods: ['GET','POST','PUT','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Rate limiting ────────────────────────────────────────────────────────────
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    message: { error: 'Too many attempts, please try again later.' }
});
const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 120
});

// ── API routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',     authLimiter, require('./api/auth'));
app.use('/api/orgs',     apiLimiter,  require('./api/orgs'));
app.use('/api/users',    apiLimiter,  require('./api/users'));
app.use('/api/wallets',  apiLimiter,  require('./api/wallets'));
app.use('/api/trades',   apiLimiter,  require('./api/trades'));

// ── Static: main app ─────────────────────────────────────────────────────────
const publicPath = path.join(__dirname, 'dist/public');
const deskPath = path.join(__dirname, 'dist/desk');

app.use(express.static(publicPath));
app.use('/.well-known', express.static(path.join(__dirname, '.well-known')));

// ── Static: desk app ─────────────────────────────────────────────────────────
// Serve desk assets at root too — Parcel outputs root-relative asset paths
app.use(express.static(deskPath));
app.use('/desk', express.static(deskPath));
app.get('/desk', (req, res) => {
    const f = path.join(deskPath, 'index.html');
    if (require('fs').existsSync(f)) return res.sendFile(f);
    res.status(503).send('Desk not built yet. Run: npm run build');
});
app.get('/desk/*path', (req, res) => {
    const f = path.join(deskPath, 'index.html');
    if (require('fs').existsSync(f)) return res.sendFile(f);
    res.status(503).send('Desk not built yet. Run: npm run build');
});

// ── Fallback: main app ───────────────────────────────────────────────────────
app.get('/*path', (req, res) => {
    const f = path.join(publicPath, 'index.html');
    if (require('fs').existsSync(f)) return res.sendFile(f);
    res.status(503).send('App not built yet. Run: npm run build');
});

// ── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`xTrader running on port ${PORT}`);
});
