import Project from '../models/Project.js';

/**
 * @desc    Récupérer tous les projets de l'utilisateur
 * @route   GET /api/projects
 * @access  Private
 */
const getProjects = async (req, res) => {
  const projects = await Project.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean();
  res.json(projects);
};

/**
 * @desc    Créer un nouveau projet
 * @route   POST /api/projects
 * @access  Private
 */
const createProject = async (req, res) => {
  const { name, companyId, companyName, contactName, email, phone, moa, moe } = req.body;
  const newProject = new Project({
      userId: req.user.id,
      name: String(name),
      companyId: companyId ? String(companyId) : null,
      companyName: String(companyName || ''),
      contactName: String(contactName || ''),
      email: String(email || ''),
      phone: String(phone || ''),
      moa: String(moa || ''), // Maître d'ouvrage
      moe: String(moe || '')  // Maître d'oeuvre
  });
  const createdProject = await newProject.save();
  res.status(201).json(createdProject);
};

/**
 * @desc    Mettre à jour un projet
 * @route   PUT /api/projects/:id
 * @access  Private
 */
const updateProject = async (req, res) => {
    const { name, companyId, companyName, contactName, email, phone, moa, moe } = req.body;
    
    // Whitelisting explicite des champs
    const updates = {};
    if (name !== undefined) updates.name = String(name);
    if (companyId !== undefined) updates.companyId = String(companyId);
    if (companyName !== undefined) updates.companyName = String(companyName);
    if (contactName !== undefined) updates.contactName = String(contactName);
    if (email !== undefined) updates.email = String(email);
    if (phone !== undefined) updates.phone = String(phone);
    if (moa !== undefined) updates.moa = String(moa);
    if (moe !== undefined) updates.moe = String(moe);

    const updatedProject = await Project.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.id }, // Protection IDOR
        { $set: updates },
        { new: true, runValidators: true }
    );
    if (!updatedProject) {
        res.status(404);
        throw new Error("Projet non trouvé ou accès non autorisé.");
    }
    res.json(updatedProject);
};

/**
 * @desc    Supprimer un projet
 * @route   DELETE /api/projects/:id
 * @access  Private
 */
const deleteProject = async (req, res) => {
    const deletedProject = await Project.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!deletedProject) {
        res.status(404);
        throw new Error("Projet non trouvé ou accès non autorisé.");
    }
    res.json({ message: "Le projet a été supprimé." });
};

export {
    getProjects,
    createProject,
    updateProject,
    deleteProject
};
