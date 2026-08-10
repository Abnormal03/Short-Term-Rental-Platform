const { failSuccessPayment, verifyAndUpdatePayment } = require("../services/Chapa.service");

const handleUpdate = async (req, res) => {
    try {
        const body = JSON.parse(req.body.toString());
        const { tx_ref, payment_method, status } = body;

        if (status === "failed") {
            await failSuccessPayment(tx_ref, payment_method, false);
            return res.status(200).json({ success: true, message: "Recorded as failed." });
        }

        if (status === "success") {
            const { success } = await verifyAndUpdatePayment(tx_ref, payment_method);

            return res.status(200).json({ success: true, message: success ? 'Payment verified and synced.' : 'Payment synced (verification failed).' });
        }

        return res.status(200).json({ success: true, message: 'No action taken.' });
    } catch (error) {
        console.error('Chapa Callback Error:', error.message);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
}

module.exports = { handleUpdate }