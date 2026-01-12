import Company from '../models/Company.js';
import mongoose from 'mongoose';
import sanitize from 'sanitize-html';

/**
 * @desc    Récupérer toutes les entreprises de l'utilisateur connecté
 * @route   GET /api/companies
 * @access  Private
 */
const getCompanies = async (req, res) => {
    // Valider que req.user.id est un ObjectId valide
    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
        res.status(400);
        throw new Error("ID utilisateur invalide.");
    }
    const companies = await Company.find({ userId: new mongoose.Types.ObjectId(req.user.id) }).sort({ name: 1 }).lean();
    res.json(companies);
};

/**
 * @desc    Créer une nouvelle entreprise
 * @route   POST /api/companies
 * @access  Private
 */
const createCompany = async (req, res) => {
    const { name, contactName, email, phone } = req.body;

    // Valider que req.user.id est un ObjectId valide
    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
        res.status(400);
        throw new Error("ID utilisateur invalide.");
    }

    // Protection contre l'injection de masse (Mass Assignment) et XSS
    const newCompany = new Company({ 
        userId: new mongoose.Types.ObjectId(req.user.id), // Assure que l'entreprise est liée à l'utilisateur authentifié
        name: sanitize(String(name)),
        contactName: sanitize(String(contactName || '')),
        email: sanitize(String(email || '')),
        phone: sanitize(String(phone || ''))
    });
    const createdCompany = await newCompany.save();
    res.status(201).json(createdCompany);
};

/**
 * @desc    Mettre à jour une entreprise
 * @route   PUT /api/companies/:id
 * @access  Private
 */
const updateCompany = async (req, res) => {
    // Valider que req.params.id est un ObjectId valide
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        res.status(400);
        throw new Error("ID d'entreprise invalide.");
    }

    // Valider que req.user.id est un ObjectId valide
    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
        res.status(400);
        throw new Error("ID utilisateur invalide.");
    }

    // Construire la requête avec des IDs validés
    const company = await Company.findOne({
        _id: new mongoose.Types.ObjectId(req.params.id),
        userId: new mongoose.Types.ObjectId(req.user.id)
    });

    if (!company) {
        res.status(404);
        throw new Error("Entreprise non trouvée ou accès non autorisé.");
    }

    // Whitelisting des champs avec la méthode suggérée et sanitization
    const allowedFields = ['name', 'contactName', 'email', 'phone'];
    allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
            company[field] = sanitize(String(req.body[field]));
        }
    });
    const updatedCompany = await company.save();
    
    res.json(updatedCompany);
};

/**
 * @desc    Supprimer une entreprise
 * @route   DELETE /api/companies/:id
 * @access  Private
 */
const deleteCompany = async (req, res) => {
    // Valider que req.params.id est un ObjectId valide
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        res.status(400);
        throw new Error("ID d'entreprise invalide.");
    }

    // Valider que req.user.id est un ObjectId valide
    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
        res.status(400);
        throw new Error("ID utilisateur invalide.");
    }

    const deletedCompany = await Company.findOneAndDelete({
        _id: new mongoose.Types.ObjectId(req.params.id),
        userId: new mongoose.Types.ObjectId(req.user.id)
    });

    if (!deletedCompany) {
        res.status(404);
        throw new Error("Entreprise non trouvée ou accès non autorisé.");
    }
    res.json({ message: "L'entreprise a été supprimée avec succès." });
};

export {
    getCompanies,
    createCompany,
    updateCompany,
    deleteCompany
};

