const express = require('express');
require('dotenv').config();

const { clerkMiddleware } = require('@clerk/express');
const { syncUser } = require('./controllers/Auth.controller');

const app = express();

app.use(clerkMiddleware())

app.post('/webhooks/clerk', express.raw({ type: "application/json" }), syncUser);



//testing purpose....
app.get('/', (req, res) => {
    return res.status(200).json({ data: "blabla" })
})
app.listen(process.env.PORT, () => {
    console.log('listening on port: ', process.env.PORT)
})