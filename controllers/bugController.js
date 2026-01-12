import BugReport from '../models/BugReport.js';
import sanitize from 'sanitize-html';

/**
 * @desc    Créer un nouveau signalement de bug
 * @route   POST /api/bugs
 * @access  Private
 */
const createBugReport = async (req, res) => {
    const { type, description } = req.body;
    
    if (!type || !description) {
        res.status(400);
        throw new Error("Le type et la description sont requis pour un signalement.");
    }

    await BugReport.create({ 
        type: sanitize(String(type)),
        description: sanitize(String(description)),
        user: sanitize(String(req.user.username))
    });
    
    res.status(201).json({ message: "Votre signalement a bien été reçu. Merci pour votre contribution !" });
};

export { createBugReport };

