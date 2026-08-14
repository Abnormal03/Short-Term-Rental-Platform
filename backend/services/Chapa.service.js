const prisma = require("../config/db");


const handleChapaCallback = async (req, res) => {
    const { trx_ref, status } = req.query

    console.log('Chapa callback received:', { trx_ref, status })

    if (status === 'success') {
        // redirect user to your frontend success page
        return res.redirect(`${process.env.FRONTEND_URL}/payment/success?trx_ref=${trx_ref}`)
    }

    // redirect to failure page
    return res.redirect(`${process.env.FRONTEND_URL}/payment/failed?trx_ref=${trx_ref}`)
}

const initializePayment = async (paymentDetail) => {
    try {
        const transactionRef = `rental-${Date.now()}`;
        const response = await fetch('https://api.chapa.co/v1/transaction/initialize', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.CHAPA_SECRET_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "amount": paymentDetail?.price?.toString(),
                "currency": "ETB",
                "email": paymentDetail?.email.toString(),
                "first_name": paymentDetail?.first_name,
                "last_name": paymentDetail?.last_name,
                "phone_number": paymentDetail.phone_number,
                "tx_ref": transactionRef,
                "callback_url": process.env.CHAPA_CALLBACK_URL,
                "return_url": process.env.CHAPA_RETURN_URL,
                "customization[title]": "Property Booking Payment",
                "customization[description]": `Booking for Property.`,
            })
        })

        if (!response.ok) {
            throw new Error('Unable to initialize payment.')
        }

        const json = await response.json();

        if (json.status === "success") {
            return { success: true, checkout_url: json.data, tx_ref: transactionRef };
        }

        return { success: false, message: json.message, tx_ref: json.tx_ref };

    } catch (error) {
        console.log("Initialize Boking Error: ", error.message)
        throw new Error(error.message || 'Failed to Initialize Payment.');
    }
}


const failSuccessPayment = async (transactionRef, payment_method, success) => {
    try {
        const payment = await prisma.payment.update({
            where: {
                transaction_reference: transactionRef
            },
            data: {
                payment_status: success ? "COMPLETED" : "FAILED",
                payment_method: payment_method,
                booking: {
                    update: {
                        booking_status: success ? "CONFIRMED" : "CANCELLED",
                    }
                }
            },
            include: {
                booking: true
            }
        });

        return payment;
    } catch (error) {
        if (error.code === 'P2025') {
            console.error(`No payment found for reference: ${transactionRef}`);
            throw new Error('Transaction reference not found in database.');
        }
        console.error("Database Update Error:", error.message);
        throw new Error(error.message || 'Failed to Update Payment.');
    }
};

const verifyAndUpdatePayment = async (tx_ref, payment_method) => {
    try {
        const verificationData = await verifyPayment(tx_ref);

        if (verificationData.status === 'success' && verificationData.data?.status === 'success') {
            await failSuccessPayment(tx_ref, payment_method, true);
            return { success: true };
        }

        throw new Error('Error while verifying payment status from Chapa!');
    } catch (error) {
        throw new Error(error.message);
    }
};
const refund = async (tx_ref) => {
    try {
        //verify the transaction...
        const { data } = await verifyPayment(tx_ref);

        //transfer the money...
        const response = await fetch(`https://api.chapa.co/v1/refund/${data.reference}`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`
            }
        })

        if (!response.ok) {
            throw new Error('Error while refunding.');
        }
        const refundDetail = await response.json();

        if (refundDetail.status === 'success') {
            return { success: true, tx_ref: refundDetail.data.ref }
        } else {
            return { success: false };
        }
    } catch (error) {
        console.log("Chapa refund error:", error.message);
        throw new Error(error.message || "Failed to Refund from Chapa.")
    }
}


const verifyPayment = async (tx_ref) => {
    try {
        const response = await fetch(`https://api.chapa.co/v1/transaction/verify/${tx_ref}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`
            }
        });

        if (!response.ok) {
            throw new Error(`Chapa Verification Failed with HTTP status ${response.status}`);
        }

        const verification = await response.json();
        return verification;
    } catch (error) {
        throw new Error(error.message || 'Failed to verify Payment.');
    }
};


module.exports = { initializePayment, failSuccessPayment, verifyAndUpdatePayment, refund }