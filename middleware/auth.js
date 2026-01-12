import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import logger from '../utils/logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key_change_me';

const authenticateToken = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401);
    throw new Error('Accès non autorisé, token manquant.');
  }

  const decoded = jwt.verify(token, JWT_SECRET);

  if (!mongoose.Types.ObjectId.isValid(decoded.id)) {
      res.status(403);
      throw new Error('Accès non autorisé, token invalide.');
  }

  const user = await User.findById(decoded.id).select('-password');

  if (!user) {
    res.status(401);
    throw new Error('Utilisateur non trouvé.');
  }

  if (user.isActive === false) {
    res.status(403);
    throw new Error('Votre compte est désactivé.');
  }
  
  if (decoded.tokenVersion !== user.tokenVersion) {
    res.status(401);
    throw new Error('Session expirée. Veuillez vous reconnecter.');
  }

  req.user = user;
  next();
});

const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    logger.warn(`Tentative d'accès admin refusée pour l'utilisateur : ${req.user?.username}`);
    res.status(403);
    throw new Error('Accès refusé. Seuls les administrateurs sont autorisés.');
  }
};

export { authenticateToken, requireAdmin };
