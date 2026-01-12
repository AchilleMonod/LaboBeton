import { validationResult } from 'express-validator';

const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Les données fournies sont invalides.", errors: errors.array() });
  }
  next();
};

export { checkValidation };
