//import database oprations...
const { Webhook } = require('svix');
const { createUser, deleteUser } = require('../services/Auth.service');

const syncUser = async (req, res) => {

    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
        throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env');
    }

    const svix_id = req.headers["svix-id"];
    const svix_timestamp = req.headers["svix-timestamp"];
    const svix_signature = req.headers["svix-signature"];

    if (!svix_id || !svix_timestamp || !svix_signature) {
        return res.status(400).json({ error: 'Error occured -- no svix headers' });
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
        return res.status(400).json({ Error: err.message });
    }

    const { id } = evt.data;
    const eventType = evt.type;

    //sync the user of clerk to my database...

    try {

        if (eventType.type === "user.created" || eventType.type === "user.updated") {
            console.log('here...')
            await createUser(evt.data);
        }

        if (eventType.type === "user.deleted") {
            await deleteUser(id);
        }

        return res.status(200).json({ success: "database sync successful" })
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "couldnt sync the user." })
    }
}

module.exports = { syncUser }

