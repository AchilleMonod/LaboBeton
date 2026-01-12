import BugReport from '../models/BugReport.js';

/**
 * @desc    Récupérer tous les signalements de bugs
 * @route   GET /api/admin/bugs
 * @access  Private/Admin
 */
const getBugReports = async (req, res) => {
    const bugs = await BugReport.find().sort({ createdAt: -1 });
    res.json(bugs);
};

/**
 * @desc    Mettre à jour le statut d'un signalement
 * @route   PUT /api/admin/bugs/:id
 * @access  Private/Admin
 */
const updateBugReportStatus = async (req, res) => {
    const { status } = req.body;
    
    if (!status) {
        res.status(400);
        throw new Error("Le statut est requis.");
    }

    const bug = await BugReport.findByIdAndUpdate(req.params.id, { 
        status: String(status), 
        resolvedAt: status.toLowerCase() === 'resolved' ? new Date() : null 
    }, { new: true });

    if (!bug) {
        res.status(404);
        throw new Error("Signalement non trouvé.");
    }

    res.json(bug);
};

/**
 * @desc    Supprimer un signalement de bug
 * @route   DELETE /api/admin/bugs/:id
 * @access  Private/Admin
 */
const deleteBugReport = async (req, res) => {
    const bug = await BugReport.findByIdAndDelete(req.params.id);
    if (!bug) {
        res.status(404);
        throw new Error("Signalement non trouvé.");
    }
    res.json({ message: "Le signalement a été supprimé." });
};

export {
    getBugReports,
    updateBugReportStatus,
    deleteBugReport
};
