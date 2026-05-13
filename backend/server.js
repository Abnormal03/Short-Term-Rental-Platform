require('dotenv').config();
const express = require('express');

const { clerkMiddleware, requireAuth } = require('@clerk/express');
const { syncUser } = require('./controllers/Auth.controller');

const propertyRoutes = require('./routes/Properties.route');
const bookingRoutes = require('./routes/Booking.route');
const userRoutes = require('./routes/User.route');
const disputeRoutes = require('./routes/Dispute.route');

const { handleUpdate } = require('./controllers/Chapa.controller');

const app = express();

app.use(clerkMiddleware())

app.post('/webhooks/clerk', express.raw({ type: "application/json" }), syncUser);

app.post('/webhooks/chapa', express.raw({ type: "application/json" }), handleUpdate)

app.use(express.json())

//properties route...
app.use('/api/v1/properties', requireAuth(), propertyRoutes);

//booking route...
app.use('/api/v1/bookings', requireAuth(), bookingRoutes)

//user route...
app.use('/api/v1/users', requireAuth(), userRoutes)

//dispute route...
app.use('/api/v1/disputes', requireAuth(), disputeRoutes)

//testing purpose....
app.get('/', (req, res) => {
    return res.status(200).json({ data: "blabla" })
})
app.listen(process.env.PORT, () => {
    console.log('listening on port: ', process.env.PORT)
})