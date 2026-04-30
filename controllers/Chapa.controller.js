const { failSuccessPayment, verifyAndUpdatePayment } = require("../services/Chapa.service");

const handleUpdate = async (req, res) => {
    try {
        const body = JSON.parse(req.body.toString());
        const { tx_ref, payment_method, status } = body;

        if (status === "failed") {
            await failSuccessPayment(tx_ref, payment_method, false);
            return res.status(200).json({ message: "Recorded as failed" });
        }

        if (status === "success") {
            const { success } = await verifyAndUpdatePayment(tx_ref, payment_method);

            if (success) {
                //successful payment...
                return res.status(200).json({ message: 'successfully synced.' })
            } else {
                //payment unsuccessful...
                return res.status(200).json({ message: 'successfully synced.' })
            }
        }
        res.status(200).json({ message: 'nothing happened   .' });
    } catch (error) {
        console.error('Chapa Callback Error:', error.message);
        return res.status(500).send('Internal Server Error.');
    }
}

module.exports = { handleUpdate }