import { validationResult } from 'express-validator';
import mongoose from 'mongoose';

const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Les données fournies sont invalides.", errors: errors.array() });
  }
  next();
};

/**
 * Middleware pour valider qu'un paramètre d'URL est un ObjectId MongoDB valide.
 * @param {string} [paramName='id'] - Le nom du paramètre à valider dans req.params.
 */
const isValidObjectId = (paramName = 'id') => (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params[paramName])) {
        res.status(404); // Une ID invalide signifie que la ressource ne peut pas être trouvée.
        throw new Error(`Ressource non trouvée (ID invalide).`);
    }
    next();
};

export { checkValidation, isValidObjectId };
