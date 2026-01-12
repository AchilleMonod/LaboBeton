import express from 'express';
import { body } from 'express-validator';

import { loginUser, updateUserProfile } from '../controllers/authController.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { authenticateToken } from '../middleware/auth.js';
import { checkValidation } from '../middleware/validators.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

// @route   POST /api/auth/login
router.post(
  '/login',
  authLimiter, // Applique le rate limiter spécifique à l'authentification
  [
    body('username', 'Le nom d\'utilisateur est requis').trim().notEmpty().escape(),
    body('password', 'Le mot de passe est requis').notEmpty()
  ],
  checkValidation, // Valide les entrées
  asyncHandler(loginUser) // Exécute le contrôleur
);

// @route   PUT /api/auth/profile
router.put(
  '/profile',
  authenticateToken, // Protège la route
  asyncHandler(updateUserProfile) // Exécute le contrôleur
);

export default router;
