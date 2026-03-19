import './css/desk.css';
import { xstocks } from './data/xstocks.js';
import { others }  from './data/others.js';

// ── State ────────────────────────────────────────────────────────────────────
let token        = localStorage.getItem('desk_token') || null;
let user         = null;
let preToken     = null;
let pickerTarget = null;
let allTrades    = [];
let tradeFilter  = 'all';

const ALL_ASSETS = [...others, ...xstocks];

// ── API helper ───────────────────────────────────────────────────────────────
async function api(method, path, body = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch('/api' + path, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
}

async function apiPreAuth(method, path, body = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (preToken) headers['Authorization'] = `Bearer ${preToken}`;
    const res = await fetch('/api' + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
}

// ── Toast ────────────────────────────────────────────────────────────────────
let toastTimer;
function toast(msg, duration = 3000) {
    const el = document.getElementById('desk-toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), duration);
}

function copyText(text) {
    navigator.clipboard.writeText(text).catch(() => {});
    toast('Copied');
}

// ── Modal ────────────────────────────────────────────────────────────────────
function openModal(title, bodyHTML, actions) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = bodyHTML;
    const actionsEl = document.getElementById('modal-actions');
    actionsEl.innerHTML = '';
    (actions || []).forEach(a => {
        const btn = document.createElement('button');
        btn.className = `btn ${a.cls || 'btn-ghost'} btn-small`;
        btn.textContent = a.label;
        btn.onclick = a.onClick;
        actionsEl.appendChild(btn);
    });
    document.getElementById('modal-overlay').classList.add('open');
}
function closeModal() {
    document.getElementById('modal-overlay').classList.remove('open');
}
document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modal-overlay')) closeModal();
});

// ── Auth screens ─────────────────────────────────────────────────────────────
function showAuth(screen) {
    ['auth-login','auth-totp','auth-totp-setup'].forEach(id => {
        document.getElementById(id).style.display = (id === screen) ? '' : 'none';
    });
    document.getElementById('auth-screen').style.display = '';
    document.getElementById('app-shell').style.display   = 'none';
}

function showApp() {
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('app-shell').style.display   = 'flex';
}

function setAuthError(id, msg) {
    const el = document.getElementById(id);
    el.textContent = msg;
    el.classList.toggle('show', !!msg);
}

// ── Login ─────────────────────────────────────────────────────────────────────
document.getElementById('login-btn').addEventListener('click', doLogin);
document.getElementById('login-password').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });

async function doLogin() {
    setAuthError('login-error', '');
    const email    = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    if (!email || !password) return setAuthError('login-error', 'Email and password required');
    const btn = document.getElementById('login-btn');
    btn.disabled = true; btn.textContent = 'Signing in...';
    const { ok, data } = await api('POST', '/auth/login', { email, password });
    btn.disabled = false; btn.textContent = 'Sign In';
    if (!ok) return setAuthError('login-error', data.error || 'Login failed');
    if (data.totp_required) {
        preToken = data.pre_token;
        showAuth('auth-totp');
        document.getElementById('totp-code').value = '';
        document.getElementById('totp-code').focus();
        return;
    }
    await onAuthenticated(data.token, data.user);
}

// ── TOTP verify ───────────────────────────────────────────────────────────────
document.getElementById('totp-btn').addEventListener('click', doTotp);
document.getElementById('totp-code').addEventListener('keydown', e => { if (e.key === 'Enter') doTotp(); });
document.getElementById('totp-back-btn').addEventListener('click', () => showAuth('auth-login'));

async function doTotp() {
    setAuthError('totp-error', '');
    const code = document.getElementById('totp-code').value.trim();
    if (!code) return setAuthError('totp-error', 'Code required');
    const btn = document.getElementById('totp-btn');
    btn.disabled = true; btn.textContent = 'Verifying...';
    const { ok, data } = await api('POST', '/auth/login/totp', { pre_token: preToken, code });
    btn.disabled = false; btn.textContent = 'Verify';
    if (!ok) return setAuthError('totp-error', data.error || 'Invalid code');
    await onAuthenticated(data.token, data.user);
}

// ── TOTP setup ────────────────────────────────────────────────────────────────
async function startTotpSetup() {
    showAuth('auth-totp-setup');
    const { ok, data } = await api('POST', '/auth/totp/setup');
    if (!ok) return setAuthError('totp-setup-error', 'Failed to generate QR code');
    document.getElementById('totp-qr-img').src = data.qr;
}

document.getElementById('totp-setup-btn').addEventListener('click', async () => {
    setAuthError('totp-setup-error', '');
    const code = document.getElementById('totp-setup-code').value.trim();
    if (!code) return setAuthError('totp-setup-error', 'Code required');
    const btn = document.getElementById('totp-setup-btn');
    btn.disabled = true; btn.textContent = 'Confirming...';
    const { ok, data } = await api('POST', '/auth/totp/confirm', { code });
    btn.disabled = false; btn.textContent = 'Confirm & Enable';
    if (!ok) return setAuthError('totp-setup-error', data.error || 'Invalid code');
    toast('Authenticator enabled!');
    const meRes = await api('GET', '/auth/me');
    if (meRes.ok) {
        user = meRes.data.user;
        renderShell();
        showApp();
        navTo('trades');
    }
});

async function onAuthenticated(jwt, userData) {
    token = jwt;
    user  = userData;
    localStorage.setItem('desk_token', token);
    if (user.totp_setup_required) return startTotpSetup();
    renderShell();
    showApp();
    navTo('trades');
}

// ── Shell ─────────────────────────────────────────────────────────────────────
function renderShell() {
    document.getElementById('sidebar-user').textContent = user.display_name || user.email;
    const roleLabel = user.is_owner ? 'Owner' : user.role === 'compliance_officer' ? 'Compliance Officer' : 'Desk Trader';
    document.getElementById('sidebar-role').textContent = roleLabel;
    document.getElementById('sidebar-org').textContent  = user.org_name || '';
    // Only hide officer-only items for non-officers; compose is visible to all
    document.querySelectorAll('.officer-only').forEach(el => { el.style.display = user.role === 'compliance_officer' ? '' : 'none'; });
}

// ── Navigation ────────────────────────────────────────────────────────────────
document.querySelectorAll('#sidebar-nav button').forEach(btn => {
    btn.addEventListener('click', () => navTo(btn.id.replace('nav-', '')));
});

function navTo(name) {
    document.querySelectorAll('#sidebar-nav button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const navBtn = document.getElementById('nav-' + name);
    const view   = document.getElementById('view-' + name);
    if (navBtn) navBtn.classList.add('active');
    if (view)   view.classList.add('active');
    if (name === 'trades')  loadTrades();
    if (name === 'wallets') loadWallets();
    if (name === 'team')    loadTeam();
    if (name === 'compose') loadComposeWallets();
}

// ── Logout ────────────────────────────────────────────────────────────────────
document.getElementById('logout-btn').addEventListener('click', () => {
    token = null; user = null;
    localStorage.removeItem('desk_token');
    showAuth('auth-login');
});

// ── Trades ────────────────────────────────────────────────────────────────────
async function loadTrades() {
    document.getElementById('trades-sub').textContent =
        user.role === 'compliance_officer' ? 'Review and manage all trade proposals' : 'Your trade proposals';
    document.getElementById('trades-table-wrap').innerHTML = '<div class="empty-state"><span class="spinner"></span></div>';
    const { ok, data } = await api('GET', '/trades');
    if (!ok) { document.getElementById('trades-table-wrap').innerHTML = '<div class="empty-state">Failed to load trades</div>'; return; }
    allTrades = data.trades || [];
    renderTradesTable();
}

document.querySelectorAll('#trades-filter-bar button').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('#trades-filter-bar button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        tradeFilter = btn.dataset.filter;
        renderTradesTable();
    });
});

function renderTradesTable() {
    const trades = tradeFilter === 'all' ? allTrades : allTrades.filter(t => t.status === tradeFilter);
    const wrap = document.getElementById('trades-table-wrap');
    if (trades.length === 0) { wrap.innerHTML = '<div class="empty-state">No trades found</div>'; return; }
    const isOfficer = user.role === 'compliance_officer';
    let html = `<table class="desk-table"><thead><tr>
        <th>ID</th>${isOfficer ? '<th>Trader</th>' : ''}<th>Type</th><th>Wallet</th>
        <th>Offer</th><th>Receive</th><th>Status</th><th>Date</th><th></th>
    </tr></thead><tbody>`;
    trades.forEach(t => {
        const typeBadge = `<span class="badge" style="background:#2a2a2a;border:1px solid #333;color:var(--text-dim);font-size:10px">${(t.trade_type || 'otc').toUpperCase()}</span>`;
        html += `<tr>
            <td><span class="wallet-addr" onclick="window.deskCopy('${t.id}')">#${t.id}</span></td>
            ${isOfficer ? `<td>${t.trader_name || t.trader_email || '—'}</td>` : ''}
            <td>${typeBadge}</td>
            <td><span class="wallet-addr" title="${t.wallet_pubkey}" onclick="window.deskCopy('${t.wallet_pubkey}')">${t.wallet_label || shortAddr(t.wallet_pubkey)}</span></td>
            <td>${t.token1_amount} ${t.token1_symbol || ''}</td>
            <td>${t.token3_amount} ${t.token3_symbol || ''}</td>
            <td><span class="badge badge-${t.status}">${t.status}</span></td>
            <td>${new Date(t.created_at).toLocaleDateString()}</td>
            <td style="white-space:nowrap;display:flex;gap:6px;align-items:center">${buildTradeActions(t)}</td>
        </tr>`;
    });
    wrap.innerHTML = html + '</tbody></table>';
}

function buildTradeActions(t) {
    const isOfficer = user.role === 'compliance_officer';
    let btns = `<button class="btn btn-ghost btn-small" onclick="window.deskViewTrade(${t.id})">View</button>`;
    if (isOfficer && t.status === 'pending') {
        btns += `<button class="btn btn-approve btn-small" onclick="window.deskReviewTrade(${t.id},'approved')">Approve</button>`;
        btns += `<button class="btn btn-reject btn-small" onclick="window.deskReviewTrade(${t.id},'rejected')">Reject</button>`;
    }
    if (t.status === 'approved') {
        btns += `<button class="btn btn-primary btn-small" onclick="window.deskExecuteTrade(${t.id})">Execute</button>`;
    }
    return btns;
}

window.deskCopy = (text) => copyText(String(text));

window.deskViewTrade = (id) => {
    const t = allTrades.find(x => x.id === id);
    if (!t) return;
    openModal(`Trade #${t.id}`, `
        <table style="width:100%;font-size:13px;border-collapse:collapse">
            <tr><td style="color:var(--text-dim);padding:5px 0;width:120px">Type</td><td><span style="text-transform:uppercase;font-size:11px;color:var(--text-dim)">${t.trade_type || 'otc'}</span></td></tr>
            <tr><td style="color:var(--text-dim);padding:5px 0">Status</td><td><span class="badge badge-${t.status}">${t.status}</span></td></tr>
            <tr><td style="color:var(--text-dim);padding:5px 0">Wallet</td><td><span class="wallet-addr" onclick="window.deskCopy('${t.wallet_pubkey}')">${t.wallet_label} — ${shortAddr(t.wallet_pubkey)}</span></td></tr>
            <tr><td style="color:var(--text-dim);padding:5px 0">Offering</td><td>${t.token1_amount} ${t.token1_symbol || t.token1_mint}</td></tr>
            <tr><td style="color:var(--text-dim);padding:5px 0">Receiving</td><td>${t.token3_amount} ${t.token3_symbol || t.token3_mint}</td></tr>
            <tr><td style="color:var(--text-dim);padding:5px 0">Counterparty</td><td>${t.buyer_wallet ? `<span class="wallet-addr" onclick="window.deskCopy('${t.buyer_wallet}')">${shortAddr(t.buyer_wallet)}</span>` : 'Open market'}</td></tr>
            <tr><td style="color:var(--text-dim);padding:5px 0">Memo</td><td>${t.memo || '—'}</td></tr>
            ${t.reviewer_name ? `<tr><td style="color:var(--text-dim);padding:5px 0">Reviewed by</td><td>${t.reviewer_name}</td></tr>` : ''}
            ${t.review_note  ? `<tr><td style="color:var(--text-dim);padding:5px 0">Review note</td><td>${t.review_note}</td></tr>` : ''}
            ${t.tx_signature ? `<tr><td style="color:var(--text-dim);padding:5px 0">Tx</td><td><span class="wallet-addr" onclick="window.deskCopy('${t.tx_signature}')">${shortAddr(t.tx_signature)}</span></td></tr>` : ''}
            <tr><td style="color:var(--text-dim);padding:5px 0">Created</td><td>${new Date(t.created_at).toLocaleString()}</td></tr>
        </table>`,
        [{ label: 'Close', cls: 'btn-ghost', onClick: closeModal }]
    );
};

window.deskReviewTrade = (id, decision) => {
    const noteInput = decision === 'rejected' ? `
        <div class="form-group" style="margin-top:12px">
            <label>Rejection note <span style="color:var(--text-dim)">(optional)</span></label>
            <textarea id="review-note" style="background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);font-family:Ubuntu,sans-serif;font-size:13px;padding:9px 11px;width:100%;resize:vertical;min-height:70px;outline:none"></textarea>
        </div>` : '';
    openModal(
        `${decision === 'approved' ? 'Approve' : 'Reject'} Trade #${id}`,
        `<p style="color:var(--text-dim);font-size:13px">Are you sure you want to ${decision} this trade?</p>${noteInput}`,
        [
            { label: 'Cancel', cls: 'btn-ghost', onClick: closeModal },
            { label: decision === 'approved' ? 'Approve' : 'Reject',
              cls: decision === 'approved' ? 'btn-approve' : 'btn-reject',
              onClick: async () => {
                const note = document.getElementById('review-note')?.value || '';
                closeModal();
                const { ok, data } = await api('PUT', `/trades/${id}/review`, { decision, note });
                if (!ok) return toast(data.error || 'Review failed');
                toast(`Trade #${id} ${decision}`);
                loadTrades();
              }
            }
        ]
    );
};

window.deskExecuteTrade = (id) => {
    openModal(`Execute Trade #${id}`,
        `<p style="color:var(--text-dim);font-size:13px">This will sign and broadcast the transaction on-chain. This cannot be undone.</p>`,
        [
            { label: 'Cancel', cls: 'btn-ghost', onClick: closeModal },
            { label: 'Execute', cls: 'btn-primary', onClick: async () => {
                closeModal();
                toast('Executing trade...', 10000);
                const { ok, data } = await api('POST', `/trades/${id}/execute`);
                if (!ok) return toast(data.error || 'Execution failed');
                toast(`Trade #${id} executed! Tx: ${shortAddr(data.signature)}`, 6000);
                loadTrades();
            }}
        ]
    );
};

// ── Wallets ───────────────────────────────────────────────────────────────────
async function loadWallets() {
    const isOfficer = user.role === 'compliance_officer';
    document.getElementById('wallets-sub').textContent = isOfficer
        ? 'Manage custodial wallets for your organization'
        : 'Wallets assigned to you';
    const actionsEl = document.getElementById('wallets-actions');
    actionsEl.innerHTML = isOfficer ? `<button class="btn btn-ghost btn-small" id="gen-wallet-btn">+ Generate Wallet</button>` : '';
    if (isOfficer) {
        document.getElementById('gen-wallet-btn').addEventListener('click', showGenerateWallet);
    }
    document.getElementById('wallets-table-wrap').innerHTML = '<div class="empty-state"><span class="spinner"></span></div>';
    const { ok, data } = await api('GET', '/wallets');
    if (!ok) { document.getElementById('wallets-table-wrap').innerHTML = '<div class="empty-state">Failed to load wallets</div>'; return; }
    renderWalletsTable(data.wallets || [], data.org_name || user.org_name);
}

function renderWalletsTable(wallets, org_name) {
    const isOfficer = user.role === 'compliance_officer';
    const wrap = document.getElementById('wallets-table-wrap');
    if (wallets.length === 0) { wrap.innerHTML = '<div class="empty-state">No wallets yet</div>'; return; }
    let html = `<table class="desk-table"><thead><tr>
        <th>Label</th><th>Public Key</th>
        ${isOfficer ? '<th>Assigned To</th>' : ''}
        <th>Balance</th>
        <th>Approved</th><th>Created</th>
        ${isOfficer ? '<th></th>' : ''}
    </tr></thead><tbody>`;
    wallets.forEach(w => {
        const assignedLabel = w.assigned_to_name
            ? w.assigned_to_name
            : `<span style="color:var(--teal);font-size:12px">⬡ ${org_name}</span>`;
        html += `<tr id="wallet-row-${w.id}">
            <td>${w.label}</td>
            <td><span class="wallet-addr" onclick="window.deskCopy('${w.public_key}')">${shortAddr(w.public_key)}</span></td>
            ${isOfficer ? `<td>${assignedLabel}</td>` : ''}
            <td id="wallet-bal-${w.id}" style="color:var(--text-dim);font-size:13px"><span class="spinner"></span></td>
            <td>${w.approved ? '<span class="badge badge-approved">Approved</span>' : '<span class="badge badge-pending">Pending</span>'}</td>
            <td>${new Date(w.created_at).toLocaleDateString()}</td>
            ${isOfficer ? `<td style="text-align:right;position:relative">
                <button class="btn btn-ghost btn-small wallet-cog-btn" onclick="window.deskToggleWalletActions(${w.id})" title="Actions">⚙</button>
                <div id="wallet-actions-${w.id}" class="wallet-actions-menu" style="display:none">
                    ${buildWalletActions(w)}
                </div>
            </td>` : ''}
        </tr>`;
    });
    wrap.innerHTML = html + '</tbody></table>';
    window._walletOrgName = org_name;

    // Fetch SOL balances async for each wallet
    const rpc = '/api/rpc-proxy'; // we'll call Solana directly
    wallets.forEach(w => fetchWalletBalance(w.public_key, w.id));
}

window.deskToggleWalletActions = (id) => {
    const el = document.getElementById(`wallet-actions-${id}`);
    if (!el) return;
    const isOpen = el.style.display !== 'none';
    // Close all other open menus first
    document.querySelectorAll('.wallet-actions-menu').forEach(m => m.style.display = 'none');
    el.style.display = isOpen ? 'none' : 'block';
    // Close on outside click
    if (!isOpen) {
        setTimeout(() => {
            document.addEventListener('click', function handler(e) {
                if (!el.contains(e.target) && !e.target.classList.contains('wallet-cog-btn')) {
                    el.style.display = 'none';
                    document.removeEventListener('click', handler);
                }
            });
        }, 0);
    }
};

async function fetchWalletBalance(pubkey, walletId) {
    const balEl = document.getElementById(`wallet-bal-${walletId}`);
    if (!balEl) return;
    try {
        const rpc = window._deskRpc || 'https://api.mainnet-beta.solana.com';
        const res = await fetch(rpc, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0', id: 1,
                method: 'getBalance',
                params: [pubkey, { commitment: 'confirmed' }]
            })
        });
        const json = await res.json();
        const lamports = json?.result?.value ?? 0;
        const sol = (lamports / 1e9).toFixed(4);
        balEl.innerHTML = `<span style="color:var(--text)">${sol}</span> <span style="color:var(--text-dim);font-size:11px">SOL</span>`;
    } catch {
        balEl.innerHTML = '<span style="color:var(--text-dim)">—</span>';
    }
}

function buildWalletActions(w) {
    let btns = `<button class="btn btn-ghost btn-small" onclick="window.deskRelabelWallet(${w.id},'${w.label.replace(/'/g,"\\'")}')">Rename</button>`;
    btns += `<button class="btn btn-ghost btn-small" onclick="window.deskAssignWallet(${w.id})">Assign</button>`;
    if (!w.approved) btns += `<button class="btn btn-approve btn-small" onclick="window.deskApproveWallet(${w.id})">Approve</button>`;
    return btns;
}

function showGenerateWallet() {
    openModal('Generate Wallet', `
        <p style="color:var(--text-dim);font-size:13px;margin-bottom:14px">A new Solana keypair will be generated server-side. The private key is encrypted and never exposed.</p>
        <div class="form-group">
            <label>Wallet Label</label>
            <input type="text" id="gen-wallet-label" placeholder="e.g. Desk A — Primary" style="background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);font-family:Ubuntu,sans-serif;font-size:13px;padding:9px 11px;width:100%;outline:none" />
        </div>`,
        [
            { label: 'Cancel', cls: 'btn-ghost', onClick: closeModal },
            { label: 'Generate', cls: 'btn-primary', onClick: async () => {
                const label = document.getElementById('gen-wallet-label')?.value?.trim();
                if (!label) return toast('Label required');
                closeModal();
                const { ok, data } = await api('POST', '/wallets/generate', { label });
                if (!ok) return toast(data.error || 'Failed to generate wallet');
                toast(`Wallet "${label}" generated`);
                loadWallets();
            }}
        ]
    );
}

window.deskApproveWallet = async (id) => {
    const { ok, data } = await api('PUT', `/wallets/${id}/approve`);
    if (!ok) return toast(data.error || 'Failed');
    toast('Wallet approved');
    loadWallets();
};

window.deskRelabelWallet = (id, currentLabel) => {
    openModal('Rename Wallet', `
        <div class="form-group">
            <label>New Label</label>
            <input type="text" id="relabel-input" value="${currentLabel}" style="background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);font-family:Ubuntu,sans-serif;font-size:13px;padding:9px 11px;width:100%;outline:none" />
        </div>`,
        [
            { label: 'Cancel', cls: 'btn-ghost', onClick: closeModal },
            { label: 'Save', cls: 'btn-primary', onClick: async () => {
                const label = document.getElementById('relabel-input')?.value?.trim();
                if (!label) return toast('Label required');
                closeModal();
                const { ok, data } = await api('PUT', `/wallets/${id}/label`, { label });
                if (!ok) return toast(data.error || 'Failed');
                toast('Wallet renamed');
                loadWallets();
            }}
        ]
    );
};

window.deskAssignWallet = async (id) => {
    const teamRes = await api('GET', '/users');
    if (!teamRes.ok) return toast('Failed to load users');
    const traders = (teamRes.data.users || []).filter(u => u.role === 'desk_trader' && u.active);
    const orgName = window._walletOrgName || user.org_name || 'Org Treasury';
    const options = traders.map(u => `<option value="${u.id}">${u.display_name || u.email}</option>`).join('');
    openModal('Assign Wallet', `
        <div class="form-group">
            <label>Assign To</label>
            <select id="assign-user" style="background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);font-family:Ubuntu,sans-serif;font-size:13px;padding:9px 11px;width:100%;outline:none">
                <option value="">⬡ ${orgName} (Org Treasury)</option>
                ${options}
            </select>
        </div>`,
        [
            { label: 'Cancel', cls: 'btn-ghost', onClick: closeModal },
            { label: 'Save', cls: 'btn-primary', onClick: async () => {
                const uid = document.getElementById('assign-user')?.value || null;
                closeModal();
                const { ok, data } = await api('PUT', `/wallets/${id}/assign`, { user_id: uid ? parseInt(uid) : null });
                if (!ok) return toast(data.error || 'Failed');
                toast('Wallet assignment updated');
                loadWallets();
            }}
        ]
    );
};

// ── Team ──────────────────────────────────────────────────────────────────────
async function loadTeam() {
    document.getElementById('team-table-wrap').innerHTML = '<div class="empty-state"><span class="spinner"></span></div>';
    // Only show invite button for owner
    document.getElementById('invite-btn').style.display = user.is_owner ? '' : 'none';
    const { ok, data } = await api('GET', '/users');
    if (!ok) { document.getElementById('team-table-wrap').innerHTML = '<div class="empty-state">Failed to load team</div>'; return; }
    renderTeamTable(data.users || []);
}

function renderTeamTable(users) {
    const wrap = document.getElementById('team-table-wrap');
    if (users.length === 0) { wrap.innerHTML = '<div class="empty-state">No team members yet</div>'; return; }
    const showRoleCol = user.is_owner;
    let html = `<table class="desk-table"><thead><tr>
        <th>Name</th><th>Email</th><th>Role</th><th>2FA</th><th>Status</th>
        ${showRoleCol ? '<th>Promote / Demote</th>' : ''}<th></th>
    </tr></thead><tbody>`;
    users.forEach(u => {
        let roleLabel;
        if (u.is_owner)                          roleLabel = 'Owner';
        else if (u.role === 'compliance_officer') roleLabel = 'Compliance Officer';
        else                                      roleLabel = 'Desk Trader';

        const isSelf        = u.id === user.id;
        const targetOwner   = u.is_owner;
        const targetOfficer = u.role === 'compliance_officer' && !u.is_owner;

        // Activate/deactivate
        let toggle = '';
        if (!isSelf && !targetOwner) {
            if (!targetOfficer || user.is_owner) {
                toggle = u.active
                    ? `<button class="btn btn-ghost btn-small" onclick="window.deskToggleUser(${u.id},false)">Deactivate</button>`
                    : `<button class="btn btn-approve btn-small" onclick="window.deskToggleUser(${u.id},true)">Activate</button>`;
            }
        }

        // Promote/demote — owner only, not self, not other owners
        let roleBtn = '';
        if (showRoleCol && !isSelf && !targetOwner) {
            if (u.role === 'desk_trader') {
                roleBtn = `<button class="btn btn-approve btn-small" onclick="window.deskChangeRole(${u.id},'compliance_officer')">↑ Promote</button>`;
            } else {
                roleBtn = `<button class="btn btn-ghost btn-small" onclick="window.deskChangeRole(${u.id},'desk_trader')">↓ Demote</button>`;
            }
        }

        html += `<tr>
            <td>${u.display_name || '—'}</td>
            <td>${u.email}</td>
            <td>${roleLabel}</td>
            <td>${u.totp_enabled ? '<span class="badge badge-approved">On</span>' : '<span class="badge badge-pending">Off</span>'}</td>
            <td>${u.active ? '<span class="badge badge-approved">Active</span>' : '<span class="badge badge-rejected">Inactive</span>'}</td>
            ${showRoleCol ? `<td>${roleBtn}</td>` : ''}
            <td>${toggle}</td>
        </tr>`;
    });
    wrap.innerHTML = html + '</tbody></table>';
}

window.deskChangeRole = (id, role) => {
    const label = role === 'compliance_officer' ? 'Promote to Compliance Officer' : 'Demote to Desk Trader';
    openModal(label, `<p style="color:var(--text-dim);font-size:13px">Are you sure you want to change this user's role?</p>`, [
        { label: 'Cancel', cls: 'btn-ghost', onClick: closeModal },
        { label: 'Confirm', cls: 'btn-primary', onClick: async () => {
            closeModal();
            const { ok, data } = await api('PUT', `/users/${id}/role`, { role });
            if (!ok) return toast(data.error || 'Failed');
            toast('Role updated');
            loadTeam();
        }}
    ]);
};

window.deskToggleUser = async (id, active) => {
    const { ok, data } = await api('PUT', `/users/${id}/active`, { active });
    if (!ok) return toast(data.error || 'Failed');
    toast(active ? 'User activated' : 'User deactivated');
    loadTeam();
};

document.getElementById('invite-btn').addEventListener('click', () => {
    openModal('Invite User', `
        <div class="form-group" style="margin-bottom:12px">
            <label>Email</label>
            <input type="email" id="invite-email" style="background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);font-family:Ubuntu,sans-serif;font-size:13px;padding:9px 11px;width:100%;outline:none" />
        </div>
        <div class="form-group" style="margin-bottom:12px">
            <label>Display Name <span style="color:var(--text-dim)">(optional)</span></label>
            <input type="text" id="invite-name" style="background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);font-family:Ubuntu,sans-serif;font-size:13px;padding:9px 11px;width:100%;outline:none" />
        </div>
        <div class="form-group">
            <label>Role</label>
            <select id="invite-role" style="background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);font-family:Ubuntu,sans-serif;font-size:13px;padding:9px 11px;width:100%;outline:none">
                <option value="desk_trader">Desk Trader</option>
                <option value="compliance_officer">Compliance Officer</option>
            </select>
        </div>`,
        [
            { label: 'Cancel', cls: 'btn-ghost', onClick: closeModal },
            { label: 'Send Invite', cls: 'btn-primary', onClick: async () => {
                const email        = document.getElementById('invite-email')?.value?.trim();
                const display_name = document.getElementById('invite-name')?.value?.trim();
                const role         = document.getElementById('invite-role')?.value;
                if (!email) return toast('Email required');
                closeModal();
                const { ok, data } = await api('POST', '/auth/invite', { email, display_name, role });
                if (!ok) return toast(data.error || 'Invite failed');
                toast('Invitation sent');
                loadTeam();
            }}
        ]
    );
});

// ── Compose ───────────────────────────────────────────────────────────────────
async function loadComposeWallets() {
    const sel = document.getElementById('compose-wallet');
    sel.innerHTML = '<option value="">Loading...</option>';
    const { ok, data } = await api('GET', '/wallets');
    sel.innerHTML = '<option value="">Select wallet...</option>';
    if (!ok || !data.wallets?.length) {
        sel.innerHTML = '<option value="">No approved wallets available</option>';
        return;
    }
    // Officers see all approved wallets; traders see only their assigned ones
    const available = data.wallets.filter(w => w.approved && w.active);
    if (!available.length) {
        sel.innerHTML = '<option value="">No approved wallets available</option>';
        return;
    }
    available.forEach(w => {
        const opt = document.createElement('option');
        opt.value = w.id;
        const assignedTo = w.assigned_to_name || data.org_name || 'Org Treasury';
        opt.textContent = `${w.label} — ${shortAddr(w.public_key)} (${assignedTo})`;
        sel.appendChild(opt);
    });
}

// Asset picker
let pickerAssets = ALL_ASSETS;

function buildPicker() {
    const list = document.getElementById('asset-picker-list');
    list.innerHTML = '';
    pickerAssets.forEach(a => {
        const div = document.createElement('div');
        div.className = 'picker-item';
        div.innerHTML = `<img src="${a.icon}" onerror="this.style.display='none'" /><div><div class="pi-symbol">${a.symbol}</div><div class="pi-name">${a.name}</div></div>`;
        div.addEventListener('click', () => selectAsset(a));
        list.appendChild(div);
    });
}

document.getElementById('asset-picker-search').addEventListener('input', e => {
    const q = e.target.value.toLowerCase();
    pickerAssets = q ? ALL_ASSETS.filter(a => a.symbol.toLowerCase().includes(q) || a.name.toLowerCase().includes(q)) : ALL_ASSETS;
    buildPicker();
});

document.getElementById('compose-asset1-btn').addEventListener('click', () => openPicker('asset1'));
document.getElementById('compose-asset3-btn').addEventListener('click', () => openPicker('asset3'));
document.getElementById('asset-picker-close').addEventListener('click', closePicker);
document.getElementById('asset-picker-overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('asset-picker-overlay')) closePicker();
});

function openPicker(target) {
    pickerTarget = target;
    pickerAssets = ALL_ASSETS;
    document.getElementById('asset-picker-search').value = '';
    buildPicker();
    document.getElementById('asset-picker-overlay').classList.add('open');
}
function closePicker() {
    document.getElementById('asset-picker-overlay').classList.remove('open');
    pickerTarget = null;
}

function selectAsset(asset) {
    if (!pickerTarget) return;
    const n   = pickerTarget === 'asset1' ? '1' : '3';
    const btn = document.getElementById(`compose-${pickerTarget}-btn`);
    const inp = document.getElementById(`compose-mint${n}`);
    const amt = document.getElementById(`compose-amount${n}`);
    btn.innerHTML = `<img src="${asset.icon}" onerror="this.style.display='none'" /><span>${asset.symbol}</span>`;
    inp.value = asset.mint;
    amt.disabled = false;
    amt.dataset.symbol   = asset.symbol;
    amt.dataset.decimals = asset.decimals;
    closePicker();
}

['1','3'].forEach(n => {
    document.getElementById(`compose-amount${n}`).addEventListener('input', async e => {
        const mint  = document.getElementById(`compose-mint${n}`).value;
        const amt   = parseFloat(e.target.value);
        const valEl = document.getElementById(`compose-value${n}`);
        if (!mint || !amt || amt <= 0) { valEl.textContent = ''; return; }
        try {
            const res  = await fetch(`https://lite-api.jup.ag/price/v3?ids=${mint}`);
            const json = await res.json();
            const price = json?.[mint]?.usdPrice;
            valEl.textContent = price ? `≈ $${(price * amt).toFixed(2)}` : '';
        } catch { valEl.textContent = ''; }
    });
});

document.getElementById('compose-submit-btn').addEventListener('click', async () => {
    const wallet_id      = document.getElementById('compose-wallet').value;
    const trade_type     = document.getElementById('compose-trade-type').value;
    const token1_mint    = document.getElementById('compose-mint1').value;
    const token1_amount  = document.getElementById('compose-amount1').value;
    const token1_symbol  = document.getElementById('compose-amount1').dataset.symbol || '';
    const token3_mint    = document.getElementById('compose-mint3').value;
    const token3_amount  = document.getElementById('compose-amount3').value;
    const token3_symbol  = document.getElementById('compose-amount3').dataset.symbol || '';
    const buyer_wallet   = document.getElementById('compose-buyer').value.trim() || null;
    const memo           = document.getElementById('compose-memo').value.trim() || null;
    const errEl = document.getElementById('compose-error');
    const showErr = msg => { errEl.textContent = msg; errEl.classList.add('show'); };
    errEl.classList.remove('show');
    if (!wallet_id)    return showErr('Please select a wallet');
    if (!token1_mint)  return showErr('Please choose an asset to offer');
    if (!token1_amount || parseFloat(token1_amount) <= 0) return showErr('Please enter an offer amount');
    if (!token3_mint)  return showErr('Please choose an asset to receive');
    if (!token3_amount || parseFloat(token3_amount) <= 0) return showErr('Please enter a receive amount');
    const btn = document.getElementById('compose-submit-btn');
    btn.disabled = true; btn.textContent = 'Submitting...';
    const { ok, data } = await api('POST', '/trades', {
        wallet_id: parseInt(wallet_id),
        trade_type,
        token1_mint, token1_symbol, token1_amount,
        token3_mint, token3_symbol, token3_amount,
        buyer_wallet, memo
    });
    btn.disabled = false; btn.textContent = 'Submit for Review';
    if (!ok) return showErr(data.error || 'Submission failed');
    toast('Trade submitted for review');
    document.getElementById('compose-trade-type').value = 'otc_direct';
    ['1','3'].forEach(n => {
        document.getElementById(`compose-asset${n}-btn`).innerHTML = '<span class="asset-btn-placeholder">Choose asset</span>';
        document.getElementById(`compose-mint${n}`).value = '';
        document.getElementById(`compose-amount${n}`).value = '';
        document.getElementById(`compose-amount${n}`).disabled = true;
        document.getElementById(`compose-value${n}`).textContent = '';
    });
    document.getElementById('compose-wallet').value = '';
    document.getElementById('compose-buyer').value  = '';
    document.getElementById('compose-memo').value   = '';
    navTo('trades');
});

// ── Settings ──────────────────────────────────────────────────────────────────
document.getElementById('pw-btn').addEventListener('click', async () => {
    const current = document.getElementById('pw-current').value;
    const newPw   = document.getElementById('pw-new').value;
    const confirm = document.getElementById('pw-confirm').value;
    const errEl   = document.getElementById('pw-error');
    const sucEl   = document.getElementById('pw-success');
    errEl.classList.remove('show'); sucEl.style.display = 'none';
    if (!current || !newPw || !confirm) { errEl.textContent = 'All fields required'; errEl.classList.add('show'); return; }
    if (newPw !== confirm) { errEl.textContent = 'New passwords do not match'; errEl.classList.add('show'); return; }
    if (newPw.length < 10) { errEl.textContent = 'Password must be at least 10 characters'; errEl.classList.add('show'); return; }
    const btn = document.getElementById('pw-btn');
    btn.disabled = true; btn.textContent = 'Updating...';
    const { ok, data } = await api('PUT', '/users/me/password', { current_password: current, new_password: newPw });
    btn.disabled = false; btn.textContent = 'Update Password';
    if (!ok) { errEl.textContent = data.error || 'Failed'; errEl.classList.add('show'); return; }
    sucEl.textContent = 'Password updated successfully'; sucEl.style.display = '';
    document.getElementById('pw-current').value = '';
    document.getElementById('pw-new').value = '';
    document.getElementById('pw-confirm').value = '';
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function shortAddr(addr) {
    if (!addr) return '—';
    return addr.slice(0, 4) + '...' + addr.slice(-4);
}

// ── Init ──────────────────────────────────────────────────────────────────────
async function init() {
    // Load RPC config
    try {
        const cfgRes = await fetch('/api/config');
        const cfg = await cfgRes.json();
        window._deskRpc = cfg.rpc;
    } catch { window._deskRpc = 'https://api.mainnet-beta.solana.com'; }

    if (token) {
        const { ok, data } = await api('GET', '/auth/me');
        if (ok) {
            user = data.user;
            renderShell();
            showApp();
            navTo('trades');
            return;
        }
        localStorage.removeItem('desk_token');
        token = null;
    }
    showAuth('auth-login');
}

init();
