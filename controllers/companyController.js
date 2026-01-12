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
    const { name, contactName, email, phone } = req.body;
    
    // Whitelisting des champs modifiables
    const updates = {};
    if (name !== undefined) updates.name = String(name);
    if (contactName !== undefined) updates.contactName = String(contactName);
    if (email !== undefined) updates.email = String(email);
    if (phone !== undefined) updates.phone = String(phone);

    const updatedCompany = await Company.findOneAndUpdate(
        // Le filtre garantit que l'utilisateur ne peut modifier que ses propres entreprises
        { _id: req.params.id, userId: req.user.id }, 
        { $set: updates },
        { new: true, runValidators: true } // `new: true` pour retourner le document mis à jour
    );
    
    if (!updatedCompany) {
        res.status(404);
        throw new Error("Entreprise non trouvée ou accès non autorisé.");
    }
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
