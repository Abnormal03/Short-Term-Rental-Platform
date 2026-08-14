const { Webhook } = require('svix');
const { createUser, deleteUser, getMe: fetchMe } = require('../services/Auth.service');
const { getAuth } = require('@clerk/express')

const syncUser = async (req, res) => {

    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    // BUG FIX: was a bare throw with no try/catch — request would hang
    if (!WEBHOOK_SECRET) {
        return res.status(500).json({ success: false, message: 'Server misconfiguration: CLERK_WEBHOOK_SECRET is missing.' });
    }

    const svix_id = req.headers["svix-id"];
    const svix_timestamp = req.headers["svix-timestamp"];
    const svix_signature = req.headers["svix-signature"];

    if (!svix_id || !svix_timestamp || !svix_signature) {
        return res.status(400).json({ success: false, message: 'Error occurred — no svix headers.' });
    }

    const payload = req.body.toString();
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt;

    try {
        evt = wh.verify(payload, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature,
        });
    } catch (err) {
        console.error('Error verifying webhook:', err);
        return res.status(400).json({ success: false, message: err.message });
    }

    const { id } = evt.data;
    const eventType = evt.type;

    try {
        if (eventType === "user.created" || eventType === "user.updated") {
            await createUser(evt.data);
        }

        if (eventType === "user.deleted") {
            await deleteUser(id);
        }

        return res.status(200).json({ success: true, synced: true });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ success: false, message: "Couldn't sync the user." });
    }
}

const getMe = async (req, res) => {
    try {
        const { userId } = getAuth(req);

        const me = await fetchMe(userId);

        if (!me) {
            console.log("Me: ", me)
            return res.status(400).json({
                success: false,
                message: "Couldn't find user!"
            })
        }
        const { Role, phone_number } = me;

        return res.status(200).json({
            success: true,
            role: Role,
            phoneNumber: phone_number
        })
    } catch (error) {
        console.log("Get Me Error: ", error.message);
        return res.status(400).json({ success: false, message: "Couldn't sync the user." });
    }
}

module.exports = { syncUser, getMe }
