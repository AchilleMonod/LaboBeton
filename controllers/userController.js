import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import logger from '../utils/logger.js';

/**
 * @desc    Créer un nouvel utilisateur (par un admin)
 * @route   POST /api/users
 * @access  Private/Admin
 */
const createUser = async (req, res) => {
    const { username, password, role, companyName, address, contact, isActive } = req.body;

    const userExists = await User.findOne({ username });
    if (userExists) {
        res.status(400);
        throw new Error('Un utilisateur avec ce nom existe déjà.');
    }

    const newUser = new User({
        username: String(username),
        password: await bcrypt.hash(String(password), 10),
        role: role === 'admin' ? 'admin' : 'standard',
        isActive: Boolean(isActive),
        companyName: String(companyName || ''),
        address: String(address || ''),
        contact: String(contact || '')
    });

    const createdUser = await newUser.save();
    logger.info(`L'administrateur a créé l'utilisateur : ${username}`);
    
    // Ne retourne que les informations non sensibles
    res.status(201).json({
        _id: createdUser._id,
        username: createdUser.username,
        role: createdUser.role,
        isActive: createdUser.isActive,
    });
};

/**
 * @desc    Obtenir la liste de tous les utilisateurs
 * @route   GET /api/users
 * @access  Private/Admin
 */
const getAllUsers = async (req, res) => {
    const users = await User.find({}, '-password -tokenVersion').sort({ createdAt: -1 });
    res.json(users);
};

/**
 * @desc    Activer ou désactiver l'accès d'un utilisateur
 * @route   PUT /api/users/:id/toggle-access
 * @access  Private/Admin
 */
const toggleUserAccess = async (req, res) => {
    if (req.params.id === req.user.id) {
        res.status(400);
        throw new Error("Vous ne pouvez pas modifier votre propre statut d'accès.");
    }

    const user = await User.findById(req.params.id);
    if (!user) {
        res.status(404);
        throw new Error("Utilisateur non trouvé.");
    }

    user.isActive = !user.isActive;
    // Si l'utilisateur est désactivé, on invalide ses sessions
    if (!user.isActive) {
        user.tokenVersion = (user.tokenVersion || 0) + 1;
    }

    await user.save();
    res.json({ message: `L'accès pour l'utilisateur ${user.username} a été mis à jour.` });
};

/**
 * @desc    Supprimer un utilisateur
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
const deleteUser = async (req, res) => {
    if (req.params.id === req.user.id) {
        res.status(400);
        throw new Error("Action non autorisée : vous ne pouvez pas supprimer votre propre compte.");
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error("Utilisateur non trouvé.");
    }

    res.json({ message: "L'utilisateur a été supprimé avec succès." });
};

export {
    createUser,
    getAllUsers,
    toggleUserAccess,
    deleteUser
};
