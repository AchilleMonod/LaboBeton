import Project from '../models/Project.js';
import mongoose from 'mongoose';
import sanitize from 'sanitize-html';

/**
 * @desc    Récupérer tous les projets de l'utilisateur
 * @route   GET /api/projects
 * @access  Private
 */
const getProjects = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
    res.status(400);
    throw new Error("ID utilisateur invalide.");
  }
  const projects = await Project.find({ userId: new mongoose.Types.ObjectId(req.user.id) }).sort({ createdAt: -1 }).lean();
  res.json(projects);
};

/**
 * @desc    Créer un nouveau projet
 * @route   POST /api/projects
 * @access  Private
 */
const createProject = async (req, res) => {
  const { name, companyId, companyName, contactName, email, phone, moa, moe } = req.body;

  if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
    res.status(400);
    throw new Error("ID utilisateur invalide.");
  }

  const newProject = new Project({
      userId: new mongoose.Types.ObjectId(req.user.id),
      name: sanitize(String(name)),
      companyId: companyId ? sanitize(String(companyId)) : null,
      companyName: sanitize(String(companyName || '')),
      contactName: sanitize(String(contactName || '')),
      email: sanitize(String(email || '')),
      phone: sanitize(String(phone || '')),
      moa: sanitize(String(moa || '')), // Maître d'ouvrage
      moe: sanitize(String(moe || ''))  // Maître d'oeuvre
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
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        res.status(400);
        throw new Error("ID de projet invalide.");
    }

    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
        res.status(400);
        throw new Error("ID utilisateur invalide.");
    }

    const { name, companyId, companyName, contactName, email, phone, moa, moe } = req.body;
    
    // Whitelisting explicite des champs
    const updates = {};
    if (name !== undefined) updates.name = sanitize(String(name));
    if (companyId !== undefined) updates.companyId = sanitize(String(companyId));
    if (companyName !== undefined) updates.companyName = sanitize(String(companyName));
    if (contactName !== undefined) updates.contactName = sanitize(String(contactName));
    if (email !== undefined) updates.email = sanitize(String(email));
    if (phone !== undefined) updates.phone = sanitize(String(phone));
    if (moa !== undefined) updates.moa = sanitize(String(moa));
    if (moe !== undefined) updates.moe = sanitize(String(moe));

    const updatedProject = await Project.findOneAndUpdate(
        {
            _id: new mongoose.Types.ObjectId(req.params.id),
            userId: new mongoose.Types.ObjectId(req.user.id)
        }, // Protection IDOR
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
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        res.status(400);
        throw new Error("ID de projet invalide.");
    }

    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
        res.status(400);
        throw new Error("ID utilisateur invalide.");
    }

    const deletedProject = await Project.findOneAndDelete({
        _id: new mongoose.Types.ObjectId(req.params.id),
        userId: new mongoose.Types.ObjectId(req.user.id)
    });
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

