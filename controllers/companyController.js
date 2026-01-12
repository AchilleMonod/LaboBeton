import Company from '../models/Company.js';

/**
 * @desc    Récupérer toutes les entreprises de l'utilisateur connecté
 * @route   GET /api/companies
 * @access  Private
 */
const getCompanies = async (req, res) => {
    const companies = await Company.find({ userId: req.user.id }).sort({ name: 1 }).lean();
    res.json(companies);
};

/**
 * @desc    Créer une nouvelle entreprise
 * @route   POST /api/companies
 * @access  Private
 */
const createCompany = async (req, res) => {
    const { name, contactName, email, phone } = req.body;

    // Protection contre l'injection de masse (Mass Assignment)
    const newCompany = new Company({ 
        userId: req.user.id, // Assure que l'entreprise est liée à l'utilisateur authentifié
        name: String(name),
        contactName: String(contactName || ''),
        email: String(email || ''),
        phone: String(phone || '')
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
    const company = await Company.findOne({ _id: req.params.id, userId: req.user.id });

    if (!company) {
        res.status(404);
        throw new Error("Entreprise non trouvée ou accès non autorisé.");
    }

    // Whitelisting des champs et mise à jour du document
    const { name, contactName, email, phone } = req.body;
    if (name !== undefined) company.name = String(name);
    if (contactName !== undefined) company.contactName = String(contactName);
    if (email !== undefined) company.email = String(email);
    if (phone !== undefined) company.phone = String(phone);

    const updatedCompany = await company.save();
    
    res.json(updatedCompany);
};

/**
 * @desc    Supprimer une entreprise
 * @route   DELETE /api/companies/:id
 * @access  Private
 */
const deleteCompany = async (req, res) => {
    const deletedCompany = await Company.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
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
