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
app.use('/api/auth',    authLimiter); app.use('/api/auth',    require('./api/auth'));
app.use('/api/orgs',    apiLimiter);  app.use('/api/orgs',    require('./api/orgs'));
app.use('/api/users',   apiLimiter);  app.use('/api/users',   require('./api/users'));
app.use('/api/wallets',         apiLimiter);  app.use('/api/wallets',         require('./api/wallets'));
app.use('/api/trades',          apiLimiter);  app.use('/api/trades',          require('./api/trades'));
app.use('/api/counterparties',  apiLimiter);  app.use('/api/counterparties',  require('./api/counterparties'));

// ── Config endpoint (public) ──────────────────────────────────────────────────
app.get('/api/config', (req, res) => {
    res.json({ rpc: process.env.RPC || 'https://api.mainnet-beta.solana.com' });
});

// ── Static paths ──────────────────────────────────────────────────────────────
const fs         = require('fs');
const publicPath = path.join(__dirname, 'dist/public');
const deskPath   = path.join(__dirname, 'dist/desk');

// Desk — must come before main app static so /desk route is not swallowed
app.get('/desk', (req, res) => {
    const f = path.join(deskPath, 'index.html');
    if (fs.existsSync(f)) return res.sendFile(f);
    res.status(503).send('Desk not built yet. Run: npm run build');
});
app.get('/desk/*path', (req, res) => {
    const f = path.join(deskPath, 'index.html');
    if (fs.existsSync(f)) return res.sendFile(f);
    res.status(503).send('Desk not built yet. Run: npm run build');
});

// Serve desk static assets (CSS/JS/fonts) — Parcel emits root-relative filenames
// index:false prevents desk/index.html from being served at root
app.use(express.static(deskPath, { index: false }));

// Main app static assets
app.use(express.static(publicPath));
app.use('/.well-known', express.static(path.join(__dirname, '.well-known')));

// ── Fallback: main app ────────────────────────────────────────────────────────
app.get('/*path', (req, res) => {
    const f = path.join(publicPath, 'index.html');
    if (fs.existsSync(f)) return res.sendFile(f);
    res.status(503).send('App not built yet. Run: npm run build');
});

// ── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`xTrader running on port ${PORT}`);
});
