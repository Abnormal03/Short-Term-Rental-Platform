const prisma = require("../config/db");
const { failSuccessPayment, verifyAndUpdatePayment } = require("../services/Chapa.service");


const handleUpdate = async (req, res) => {
    try {
        const body = JSON.parse(req.body.toString());
        const { tx_ref, payment_method, status } = body;

        if (!tx_ref) {
            return res.status(400).json({ success: false, message: "Missing transaction reference." });
        }

        // 1. Fetch current payment state FIRST to prevent redundant locks/race conditions
        const existingPayment = await prisma.payment.findUnique({
            where: { transaction_reference: tx_ref },
            select: { payment_status: true }
        });

        if (!existingPayment) {
            return res.status(404).json({ success: false, message: "Transaction reference not found." });
        }

        // 2. Idempotency Guard: If already processed, respond immediately and exit
        if (existingPayment.payment_status === "COMPLETED") {
            return res.status(200).json({ success: true, message: "Payment already processed." });
        }

        // 3. Handle Failed Status
        if (status === "failed") {
            await failSuccessPayment(tx_ref, payment_method, false);
            return res.status(200).json({ success: true, message: "Recorded as failed." });
        }

        // 4. Handle Success Status
        if (status === "success") {
            const { success } = await verifyAndUpdatePayment(tx_ref, payment_method);
            return res.status(200).json({
                success: true,
                message: success ? 'Payment verified and synced.' : 'Payment synced (verification failed).'
            });
        }

        return res.status(200).json({ success: true, message: 'No action taken.' });
    } catch (error) {
        console.error('Chapa Callback Error:', error.message);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

module.exports = { handleUpdate }