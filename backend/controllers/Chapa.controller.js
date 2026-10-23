const crypto = require('crypto');
const prisma = require('../config/db');
const { verifyAndUpdatePayment } = require('../services/Chapa.service');

function safeEqualHex(left, right) {
    if (!left || !right || !/^[a-f0-9]+$/i.test(left) || !/^[a-f0-9]+$/i.test(right)) return false;
    const a = Buffer.from(left, 'hex');
    const b = Buffer.from(right, 'hex');
    return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function isValidWebhookSignature(req, rawBody) {
    const received = [req.get('x-chapa-signature'), req.get('chapa-signature')].filter(Boolean);
    if (!received.length) return false;

    const secrets = [process.env.CHAPA_WEBHOOK_SECRET, process.env.CHAPA_SECRET_KEY].filter(Boolean);
    return secrets.some((secret) => {
        const payloadSignature = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
        const secretSignature = crypto.createHmac('sha256', secret).update(secret).digest('hex');
        return received.some((signature) => safeEqualHex(signature, payloadSignature) || safeEqualHex(signature, secretSignature));
    });
}

const handleUpdate = async (req, res) => {
    try {
        const isCallback = req.method === 'GET';
        const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from('');
        if (!isCallback && !isValidWebhookSignature(req, rawBody)) {
            return res.status(401).json({ success: false, message: 'Invalid Chapa webhook signature.' });
        }

        const body = isCallback ? req.query : JSON.parse(rawBody.toString('utf8'));
        const txRef = body.tx_ref || body.trx_ref;
        const paymentMethod = body.payment_method || body.method;
        if (!txRef) {
            return res.status(400).json({ success: false, message: 'Missing transaction reference.' });
        }

        const payment = await prisma.payment.findUnique({
            where: { transaction_reference: txRef },
            select: { payment_status: true }
        });
        if (!payment) {
            return res.status(404).json({ success: false, message: 'Transaction reference not found.' });
        }
        if (payment.payment_status === 'COMPLETED') {
            return res.status(200).json({ success: true, state: 'success', message: 'Payment already processed.' });
        }

        // Callback query parameters and webhook payloads are only hints. Always
        // verify the transaction with Chapa before changing booking/payment state.
        const result = await verifyAndUpdatePayment(txRef, paymentMethod);
        if (result.state === 'pending') {
            return res.status(200).json({ success: true, state: 'pending', message: 'Payment is not final yet.' });
        }
        return res.status(200).json({
            success: true,
            state: result.state,
            message: result.state === 'success' ? 'Payment verified and synced.' : 'Payment recorded as failed.'
        });
    } catch (error) {
        console.error('Chapa callback/webhook error:', error);
        return res.status(500).json({ success: false, message: 'Unable to verify Chapa payment.' });
    }
};

module.exports = { handleUpdate };