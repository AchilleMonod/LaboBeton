import mongoose from 'mongoose';

/**
 * Middleware pour valider qu'un paramètre de requête est un ObjectId MongoDB valide.
 * @param {string} paramName - Nom du paramètre à valider (ex: 'id').
 * @returns {Function} - Middleware Express.
 */
const validateObjectId = (paramName) => (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params[paramName])) {
    res.status(400);
    throw new Error(`ID ${paramName} invalide.`);
  }
  next();
};

export default validateObjectId;
