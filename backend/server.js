require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { clerkMiddleware, requireAuth } = require('@clerk/express');
const { syncUser } = require('./controllers/Auth.controller');

const propertyRoutes = require('./routes/Properties.route');
const bookingRoutes = require('./routes/Booking.route');
const userRoutes = require('./routes/User.route');
const disputeRoutes = require('./routes/Dispute.route');
const AuthRoute = require('./routes/Auth.route');


const { handleUpdate } = require('./controllers/Chapa.controller');

const app = express();

app.use(clerkMiddleware());

// BUG FIX: cors() must be registered before express.json() so pre-flight OPTIONS
// requests are handled before any body-parsing middleware runs.
app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://patient-distinct-tuner-univ.trycloudflare.com',
    ],
    credentials: true,
}));

// Webhook routes use raw body — must be registered before express.json()
app.post('/webhooks/clerk', express.raw({ type: "application/json" }), syncUser);
app.post('/webhooks/chapa', express.raw({ type: "application/json" }), handleUpdate);

app.use(express.json());

// Properties route (public)
app.use('/api/v1/properties', propertyRoutes);

// Protected routes
app.use('/api/v1/auth', requireAuth(), AuthRoute)
app.use('/api/v1/bookings', requireAuth(), bookingRoutes);
app.use('/api/v1/users', requireAuth(), userRoutes);
app.use('/api/v1/disputes', requireAuth(), disputeRoutes);

// Health check
app.get('/', (req, res) => {
    return res.status(200).json({ success: true, message: 'Server is running.' });
});

app.listen(process.env.PORT, () => {
    console.log('Listening on port:', process.env.PORT);
});