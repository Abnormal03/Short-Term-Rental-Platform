const { getAuth } = require('@clerk/express');
const { raiseDisputeService, resolveDisputeService, getAllDisputesService } = require('../services/Dispute.service');

const raiseDispute = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { reason } = req.body;
        const { userId } = getAuth(req);

        const dispute = await raiseDisputeService(bookingId, userId, reason);
        return res.status(201).json({ success: true, dispute });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}


const resolveDispute = async (req, res) => {
    try {
        const { disputeId } = req.params;
        const { resolution, action } = req.body;

        const result = await resolveDisputeService(disputeId, resolution, action);
        return res.status(200).json({ success: true, dispute: result.dispute, action: result.action });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}


const getAllDisputes = async (req, res) => {
    try {
        // BUG FIX: was `req.body` — pagination params must come from query string on GET requests
        const { page, limit } = req.query;
        const disputes = await getAllDisputesService(page, limit);
        return res.status(200).json({ success: true, disputes });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}


module.exports = {
    resolveDispute,
    raiseDispute,
    getAllDisputes
}