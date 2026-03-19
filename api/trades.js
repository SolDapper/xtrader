'use strict';
const router = require('express').Router();
router.use(require('express').json());
const pool = require('../db/pool');
const requireAuth = require('./middleware');
const { decryptKey } = require('./wallets');
const { Connection, Keypair, VersionedTransaction } = require('@solana/web3.js');

// ── POST /api/trades ─────────────────────────────────────────────────────────
// Desk trader proposes a trade
router.post('/', requireAuth, async (req, res) => {
    if (req.user.role !== 'desk_trader') {
        return res.status(403).json({ error: 'Only desk traders can propose trades' });
    }
    const {
        wallet_id,
        token1_mint, token1_symbol, token1_amount,
        token2_mint, token2_symbol, token2_amount,
        token3_mint, token3_symbol, token3_amount,
        token4_mint, token4_symbol, token4_amount,
        buyer_wallet, memo
    } = req.body;

    if (!wallet_id || !token1_mint || !token1_amount || !token3_mint || !token3_amount) {
        return res.status(400).json({ error: 'wallet_id, token1 and token3 fields are required' });
    }

    try {
        // Verify wallet is assigned and approved for this trader
        const walletCheck = await pool.query(
            `SELECT id FROM wallets
             WHERE id=$1 AND org_id=$2 AND assigned_to=$3 AND approved=true AND active=true`,
            [wallet_id, req.user.org_id, req.user.id]
        );
        if (walletCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Wallet not available for your account' });
        }

        const result = await pool.query(
            `INSERT INTO trades (
                org_id, proposed_by, wallet_id,
                token1_mint, token1_symbol, token1_amount,
                token2_mint, token2_symbol, token2_amount,
                token3_mint, token3_symbol, token3_amount,
                token4_mint, token4_symbol, token4_amount,
                buyer_wallet, memo
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
            RETURNING *`,
            [
                req.user.org_id, req.user.id, wallet_id,
                token1_mint, token1_symbol || null, token1_amount,
                token2_mint || null, token2_symbol || null, token2_amount || null,
                token3_mint, token3_symbol || null, token3_amount,
                token4_mint || null, token4_symbol || null, token4_amount || null,
                buyer_wallet || null, memo || null
            ]
        );
        res.status(201).json({ trade: result.rows[0] });
    } catch (err) {
        console.error('Propose trade error:', err);
        res.status(500).json({ error: 'Failed to create trade proposal' });
    }
});

// ── GET /api/trades ──────────────────────────────────────────────────────────
router.get('/', requireAuth, async (req, res) => {
    const { status } = req.query;
    try {
        let query, params;
        const statusFilter = status ? `AND t.status=$2` : '';

        if (req.user.role === 'compliance_officer') {
            query = `SELECT t.*, u.display_name as trader_name, u.email as trader_email,
                            w.label as wallet_label, w.public_key as wallet_pubkey,
                            r.display_name as reviewer_name
                     FROM trades t
                     JOIN users u ON u.id = t.proposed_by
                     JOIN wallets w ON w.id = t.wallet_id
                     LEFT JOIN users r ON r.id = t.reviewed_by
                     WHERE t.org_id=$1 ${statusFilter}
                     ORDER BY t.created_at DESC`;
            params = status ? [req.user.org_id, status] : [req.user.org_id];
        } else {
            query = `SELECT t.*, w.label as wallet_label, w.public_key as wallet_pubkey,
                            r.display_name as reviewer_name
                     FROM trades t
                     JOIN wallets w ON w.id = t.wallet_id
                     LEFT JOIN users r ON r.id = t.reviewed_by
                     WHERE t.org_id=$1 AND t.proposed_by=$2 ${statusFilter}
                     ORDER BY t.created_at DESC`;
            params = status ? [req.user.org_id, req.user.id, status] : [req.user.org_id, req.user.id];
        }
        const result = await pool.query(query, params);
        res.json({ trades: result.rows });
    } catch (err) {
        console.error('Get trades error:', err);
        res.status(500).json({ error: 'Failed to fetch trades' });
    }
});

// ── GET /api/trades/:id ──────────────────────────────────────────────────────
router.get('/:id', requireAuth, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT t.*, u.display_name as trader_name, w.label as wallet_label,
                    w.public_key as wallet_pubkey, r.display_name as reviewer_name
             FROM trades t
             JOIN users u ON u.id = t.proposed_by
             JOIN wallets w ON w.id = t.wallet_id
             LEFT JOIN users r ON r.id = t.reviewed_by
             WHERE t.id=$1 AND t.org_id=$2`,
            [req.params.id, req.user.org_id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Trade not found' });
        const trade = result.rows[0];
        // Desk traders can only see their own
        if (req.user.role === 'desk_trader' && trade.proposed_by !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }
        res.json({ trade });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch trade' });
    }
});

// ── PUT /api/trades/:id/review ───────────────────────────────────────────────
// Compliance officer approves or rejects
router.put('/:id/review', requireAuth, async (req, res) => {
    if (req.user.role !== 'compliance_officer') {
        return res.status(403).json({ error: 'Only compliance officers can review trades' });
    }
    const { decision, note } = req.body;
    if (!['approved','rejected'].includes(decision)) {
        return res.status(400).json({ error: 'decision must be approved or rejected' });
    }
    try {
        const result = await pool.query(
            `UPDATE trades SET status=$1, review_note=$2, reviewed_by=$3, reviewed_at=NOW()
             WHERE id=$4 AND org_id=$5 AND status='pending'
             RETURNING *`,
            [decision, note || null, req.user.id, req.params.id, req.user.org_id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Trade not found or already reviewed' });
        }
        res.json({ trade: result.rows[0] });
    } catch (err) {
        console.error('Review trade error:', err);
        res.status(500).json({ error: 'Failed to review trade' });
    }
});

// ── POST /api/trades/:id/execute ─────────────────────────────────────────────
// Desk trader executes an approved trade — server signs and broadcasts
router.post('/:id/execute', requireAuth, async (req, res) => {
    if (req.user.role !== 'desk_trader') {
        return res.status(403).json({ error: 'Only desk traders can execute trades' });
    }
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Lock the row
        const tradeRes = await client.query(
            `SELECT t.*, w.encrypted_key FROM trades t
             JOIN wallets w ON w.id = t.wallet_id
             WHERE t.id=$1 AND t.org_id=$2 AND t.proposed_by=$3 AND t.status='approved'
             FOR UPDATE`,
            [req.params.id, req.user.org_id, req.user.id]
        );
        if (tradeRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Trade not found or not approved' });
        }
        const trade = tradeRes.rows[0];

        // Mark as executing to prevent double-execution
        await client.query(
            `UPDATE trades SET status='executed' WHERE id=$1`,
            [trade.id]
        );

        // Decrypt keypair in memory
        const secretKeyBytes = decryptKey(trade.encrypted_key);
        const keypair = Keypair.fromSecretKey(secretKeyBytes);

        // Build and sign transaction via xtrader SDK
        const rpc = process.env.RPC;
        const xtrader = require('../src/js/xtrader-sdk.js');

        const txResult = await xtrader.Create({
            rpc,
            builder: true,
            convert: true,
            tolerance: '1.2',
            priority: 'Medium',
            seller: keypair.publicKey.toString(),
            token1Mint: trade.token1_mint,
            token1Amount: trade.token1_amount,
            token2Mint: trade.token2_mint || false,
            token2Amount: trade.token2_amount || false,
            buyer: trade.buyer_wallet || false,
            token3Mint: trade.token3_mint,
            token3Amount: trade.token3_amount,
            token4Mint: trade.token4_mint || false,
            token4Amount: trade.token4_amount || false,
            memo: trade.memo || false,
            signers: false
        });

        if (!txResult || !txResult.tx) {
            await client.query(
                `UPDATE trades SET status='failed' WHERE id=$1`,
                [trade.id]
            );
            await client.query('COMMIT');
            return res.status(500).json({ error: 'Transaction build failed', details: txResult });
        }

        // Sign server-side
        const tx = txResult.tx;
        tx.sign([keypair, ...(txResult.signers || [])]);

        // Broadcast
        const connection = new Connection(rpc, 'confirmed');
        const signature = await xtrader.Send(rpc, tx);
        const status = await xtrader.Status(rpc, signature);

        if (status !== 'finalized') {
            await client.query(
                `UPDATE trades SET status='failed' WHERE id=$1`,
                [trade.id]
            );
            await client.query('COMMIT');
            return res.status(500).json({ error: 'Transaction failed to finalize' });
        }

        // Store signature
        await client.query(
            `UPDATE trades SET tx_signature=$1, executed_at=NOW() WHERE id=$2`,
            [signature, trade.id]
        );

        await client.query('COMMIT');
        res.json({ success: true, signature });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Execute trade error:', err);
        res.status(500).json({ error: 'Execution failed' });
    } finally {
        client.release();
    }
});

module.exports = router;
