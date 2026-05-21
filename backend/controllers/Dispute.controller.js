const { getAuth } = require('@clerk/express');
const { raiseDisputeService, resolveDisputeService, getAllDisputesService } = require('../services/Dispute.service');

const raiseDispute = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { reason } = req.body;
        const { userId } = getAuth(req);

        const dispute = await raiseDisputeService(bookingId, userId, reason);
        return res.status(201).json({ dispute: dispute });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}


const resolveDispute = async (req, res) => {
    try {
        const { disputeId } = req.params;
        const { resolution, action } = req.body; // resolution can be "APPROVE" or "REJECT", action can be "REFUND" or "CONFIRMED"

        const dispute = await resolveDisputeService(disputeId, resolution, action);
        return res.status(200).json({ dispute: dispute.dispute, action: dispute.action });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}


const getAllDisputes = async (req, res) => {
    try {
        const { page, limit } = req.body;
        const disputes = await getAllDisputesService(page, limit);
        return res.status(200).json({ disputes: disputes });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}


module.exports = {
    resolveDispute,
    raiseDispute,
    getAllDisputes
}