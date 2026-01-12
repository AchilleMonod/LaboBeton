import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import logger from '../utils/logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key_change_me';

/**
 * @desc    Authentifier un utilisateur et obtenir un token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res) => {
  const { username, password } = req.body;
  const safeUsername = String(username);
  const user = await User.findOne({ username: safeUsername });

  // Utilise une temporisation pour éviter les attaques de type "time-based user enumeration"
  if (!user) {
      await new Promise(resolve => setTimeout(resolve, 200)); 
      res.status(401);
      throw new Error("Identifiants incorrects.");
  }
  
  if (user.isActive === false) {
    res.status(403);
    throw new Error("Ce compte est désactivé.");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    res.status(401);
    throw new Error("Identifiants incorrects.");
  }

  // Incrémente la version du token pour invalider les anciens tokens (ex: après changement de mdp)
  user.tokenVersion = (user.tokenVersion || 0) + 1;
  user.lastLogin = new Date();
  await user.save();

  const token = jwt.sign(
    { id: user._id, role: user.role, username: user.username, tokenVersion: user.tokenVersion }, 
    JWT_SECRET, 
    { expiresIn: '12h' }
  );

  logger.info(`Connexion réussie pour : ${safeUsername}`);
  res.json({ 
    token, 
    user: { 
      id: user._id, 
      username: user.username, 
      role: user.role, 
      companyName: user.companyName, 
      logo: user.logo 
    } 
  });
};

/**
 * @desc    Mettre à jour le profil de l'utilisateur
 * @route   PUT /api/auth/profile
 * @access  Private (authentifié)
 */
const updateUserProfile = async (req, res) => {
  const { companyName, address, contact, password, siret, apeCode, legalInfo, logo } = req.body;
  
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(404);
    throw new Error("Utilisateur non trouvé.");
  }

  // Whitelisting et nettoyage des champs
  if (companyName !== undefined) user.companyName = String(companyName).substring(0, 100);
  if (address !== undefined) user.address = String(address).substring(0, 300);
  if (contact !== undefined) user.contact = String(contact).substring(0, 100);
  if (siret !== undefined) user.siret = String(siret).substring(0, 50);
  if (apeCode !== undefined) user.apeCode = String(apeCode).substring(0, 20);
  if (legalInfo !== undefined) user.legalInfo = String(legalInfo).substring(0, 200);
  if (logo !== undefined) user.logo = String(logo); // La validation de la taille est faite par le body parser

  if (password && String(password).trim() !== "") {
    const pwd = String(password);
    if (pwd.length < 8) {
        res.status(400);
        throw new Error("Le mot de passe doit contenir au moins 8 caractères.");
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(pwd, salt);
    user.tokenVersion = (user.tokenVersion || 0) + 1; // Invalide les tokens précédents
  }

  const updatedUser = await user.save();
  const userObj = updatedUser.toObject();
  
  // Exclure les données sensibles de la réponse
  delete userObj.password;
  delete userObj.tokenVersion;

  res.json(userObj);
};

export { loginUser, updateUserProfile };
