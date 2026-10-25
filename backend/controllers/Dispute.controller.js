const { getAuth } = require('@clerk/express');
const { raiseDisputeService, resolveDisputeService, getAllDisputesService } = require('../services/Dispute.service');

const raiseDispute = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { reason } = req.body;
        const { userId } = getAuth(req);

        if (typeof reason !== 'string' || !reason.trim() || reason.trim().length > 1000) {
            return res.status(400).json({ success: false, message: 'Provide a short description of the booking issue.' });
        }

        const dispute = await raiseDisputeService(bookingId, userId, reason.trim());
        return res.status(201).json({ success: true, dispute });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}


const resolveDispute = async (req, res) => {
    try {
        const { disputeId } = req.params;
        const { resolution, action } = req.body;

        if (!['APPROVE', 'REJECT'].includes(resolution) || !['CONFIRM', 'REFUND'].includes(action) ||
            (resolution === 'REJECT' && action !== 'CONFIRM')) {
            return res.status(400).json({ success: false, message: 'Choose a supported dispute resolution and action.' });
        }

        const result = await resolveDisputeService(disputeId, resolution, action);
        return res.status(200).json({ success: true, dispute: result.dispute, action: result.action });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}


const getAllDisputes = async (req, res) => {
    try {
        // BUG FIX: was `req.body` — pagination params must come from query string on GET requests
        const { page, limit, status } = req.query;
        const disputes = await getAllDisputesService(Number(page) || 1, Number(limit) || 20, status || 'OPEN');
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
