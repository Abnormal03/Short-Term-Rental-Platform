const express = require('express');

const { verifyRole } = require('../middlewares/Role.middleware');
const { raiseDispute, resolveDispute, getAllDisputes } = require('../controllers/Dispute.controller');

const router = express.Router();

// raise dispute...
router.post('/:bookingId', verifyRole(['GUEST', 'HOST']), raiseDispute);

//resolve dispute...
router.put('/:disputeId/resolve', verifyRole(['ADMIN']), resolveDispute);

// get all disputes...
router.get('/all', verifyRole(['ADMIN']), getAllDisputes);


module.exports = router;