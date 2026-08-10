const express = require('express');

const { verifyRole } = require('../middlewares/Role.middleware');
const { raiseDispute, resolveDispute, getAllDisputes } = require('../controllers/Dispute.controller');

const router = express.Router();

// get all disputes...
router.get('/all', verifyRole(['ADMIN']), getAllDisputes);

// raise dispute...
router.post('/:bookingId', verifyRole(['GUEST', 'HOST']), raiseDispute);

//resolve dispute...
router.put('/:disputeId/resolve', verifyRole(['ADMIN']), resolveDispute);

module.exports = router;