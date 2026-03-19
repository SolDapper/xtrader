'use strict';
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const FROM = process.env.SMTP_FROM || 'xTrader Desk <no-reply@xtrader.me>';

async function sendVerification(to, verifyUrl, name) {
    await transporter.sendMail({
        from: FROM,
        to,
        subject: 'Verify your xTrader Desk account',
        html: `
            <p>Hi ${name},</p>
            <p>Please verify your email address to activate your xTrader Desk account:</p>
            <p><a href="${verifyUrl}" style="color:#1dd2bd">Verify Email</a></p>
            <p>This link expires in 24 hours.</p>
            <p>— xTrader Desk</p>
        `
    });
}

async function sendInvite(to, verifyUrl, name, tempPassword, invitedBy) {
    await transporter.sendMail({
        from: FROM,
        to,
        subject: `You've been invited to xTrader Desk`,
        html: `
            <p>Hi ${name},</p>
            <p>${invitedBy} has invited you to join xTrader Desk.</p>
            <p>Your temporary password is: <strong>${tempPassword}</strong></p>
            <p>Please verify your email and change your password on first login:</p>
            <p><a href="${verifyUrl}" style="color:#1dd2bd">Accept Invitation</a></p>
            <p>— xTrader Desk</p>
        `
    });
}

async function sendPasswordReset(to, resetUrl, name) {
    await transporter.sendMail({
        from: FROM,
        to,
        subject: 'Reset your xTrader Desk password',
        html: `
            <p>Hi ${name},</p>
            <p>Click below to reset your password. This link expires in 1 hour.</p>
            <p><a href="${resetUrl}" style="color:#1dd2bd">Reset Password</a></p>
            <p>If you didn't request this, ignore this email.</p>
            <p>— xTrader Desk</p>
        `
    });
}

module.exports = { sendVerification, sendInvite, sendPasswordReset };
