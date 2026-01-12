import Settings from '../models/Settings.js';
import mongoose from 'mongoose';
import sanitize from 'sanitize-html';

/**
 * @desc    Obtenir les paramètres de l'utilisateur
 * @route   GET /api/settings
 * @access  Private
 */
const getSettings = async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
        res.status(400);
        throw new Error("ID utilisateur invalide.");
    }
    let settings = await Settings.findOne({ userId: new mongoose.Types.ObjectId(req.user.id) }).lean();
    
    // Si aucun paramètre n'est trouvé en base, on retourne un objet de paramètres par défaut
    if (!settings) {
        settings = {
            userId: req.user.id, // Important pour l'identification côté client
            specimenTypes: ['Cylindrique 16x32', 'Cylindrique 11x22', 'Cubique 15x15'],
            deliveryMethods: ['Toupie', 'Benne', 'Mixer'],
            manufacturingPlaces: ['Centrale BPE', 'Centrale Chantier'],
            mixTypes: [],
            concreteClasses: [],
            consistencyClasses: [],
            curingMethods: [],
            testTypes: [],
            preparations: [],
            nfStandards: []
        };
    }
    res.json(settings);
};

/**
 * @desc    Mettre à jour les paramètres de l'utilisateur
 * @route   PUT /api/settings
 * @access  Private
 */
const updateSettings = async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
        res.status(400);
        throw new Error("ID utilisateur invalide.");
    }

    // Whitelist des champs (tous des tableaux de chaînes de caractères)
    const allowedArrays = [
        'specimenTypes', 'deliveryMethods', 'manufacturingPlaces', 'mixTypes',
        'concreteClasses', 'consistencyClasses', 'curingMethods', 'testTypes',
        'preparations', 'nfStandards'
    ];
    
    const updates = {};
    allowedArrays.forEach(field => {
        if (Array.isArray(req.body[field])) {
            // Nettoyage : s'assure que chaque élément du tableau est une chaîne sanitizée
            updates[field] = req.body[field].map(item => sanitize(String(item).trim())).filter(Boolean);
        }
    });

    const settings = await Settings.findOneAndUpdate(
        { userId: new mongoose.Types.ObjectId(req.user.id) },
        { $set: updates },
        // `upsert: true` crée le document s'il n'existe pas
        // `new: true` retourne le document mis à jour
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    
    res.json(settings);
};

export { getSettings, updateSettings };

