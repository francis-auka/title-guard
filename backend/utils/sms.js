/**
 * sms.js — Africa's Talking SMS utility for TitleGuard
 *
 * Rules:
 * - Phone numbers are auto-formatted to +254 (Kenya)
 * - SMS failures NEVER break the main app flow
 * - All errors are caught silently and logged to console
 */

const AfricasTalking = require("africastalking");

let smsClient = null;

/**
 * Lazily initialise the SMS client so missing env vars don't crash on startup.
 */
function getSmsClient() {
    if (smsClient) return smsClient;

    const apiKey = process.env.SMS_KEY ? process.env.SMS_KEY.trim() : null;
    const username = process.env.SMS_USERNAME ? process.env.SMS_USERNAME.trim() : null;

    if (!apiKey || !username) {
        console.warn("[SMS] SMS_KEY or SMS_USERNAME not set — SMS sending disabled.");
        return null;
    }

    const at = AfricasTalking({ apiKey, username });
    smsClient = at.SMS;
    return smsClient;
}

/**
 * Format a phone number to E.164 (+254...) for Kenya.
 * Handles: 07XXXXXXXX, 7XXXXXXXX, +2547XXXXXXXX, 2547XXXXXXXX
 * @param {string} phone
 * @returns {string|null} formatted number or null if invalid
 */
function formatKenyanPhone(phone) {
    if (!phone) return null;

    const digits = String(phone).replace(/\D/g, ""); // strip non-digits

    if (digits.startsWith("254") && digits.length === 12) {
        return `+${digits}`;
    }
    if (digits.startsWith("0") && digits.length === 10) {
        return `+254${digits.slice(1)}`;
    }
    if (digits.length === 9) {
        return `+254${digits}`;
    }
    if (digits.startsWith("254") && digits.length > 12) {
        // e.g. +254... with leading +
        return `+${digits}`;
    }

    console.warn(`[SMS] Could not format phone number: ${phone}`);
    return null;
}

/**
 * Send an SMS. Never throws — all errors are caught and logged.
 * @param {string} to   - Recipient phone number (any format)
 * @param {string} message - SMS body text
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
async function sendSms(to, message) {
    try {
        const client = getSmsClient();
        if (!client) {
            return { success: false, error: "SMS client not initialized (check env vars)" };
        }

        const formattedPhone = formatKenyanPhone(to);
        if (!formattedPhone) {
            return { success: false, error: "Invalid phone number format" };
        }

        const response = await client.send({
            to: [formattedPhone],
            message,
            enqueue: true,
        });

        console.log(`[SMS] Sent to ${formattedPhone}:`, JSON.stringify(response?.SMSMessageData?.Recipients?.[0] || response));
        return { success: true, data: response };
    } catch (err) {
        const errMsg = err.message || err;
        console.error("[SMS] Failed to send SMS (non-fatal):", errMsg);
        return { success: false, error: errMsg };
    }
}

module.exports = { sendSms, formatKenyanPhone };
