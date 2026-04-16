require('dotenv').config();
const express = require('express');

const { clerkMiddleware, requireAuth } = require('@clerk/express');
const { syncUser } = require('./controllers/Auth.controller');

const propertyRoute = require('./routes/Properties.route');

const app = express();

app.use(clerkMiddleware())

app.post('/webhooks/clerk', express.raw({ type: "application/json" }), syncUser);

app.use(express.json())
app.use('/api/v1/properties', requireAuth(), propertyRoute)

//testing purpose....
app.get('/', requireAuth(), (req, res) => {
    return res.status(200).json({ data: "blabla" })
})
app.listen(process.env.PORT, () => {
    console.log('listening on port: ', process.env.PORT)
})