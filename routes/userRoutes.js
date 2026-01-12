import express from 'express';
import { body } from 'express-validator';

import {
    createUser,
    getAllUsers,
    toggleUserAccess,
    deleteUser
} from '../controllers/userController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import validateObjectId from '../middleware/validateObjectId.js';
import { checkValidation } from '../middleware/validators.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

// Toutes les routes sont protégées et réservées aux admins
router.use(authenticateToken, requireAdmin);

router.route('/')
    .get(asyncHandler(getAllUsers))
    .post(
        [
            body('username', "Un nom d'utilisateur d'au moins 3 caractères est requis.").trim().isLength({ min: 3 }).escape(),
            body('password', 'Un mot de passe d\'au moins 8 caractères est requis.').isLength({ min: 8 })
        ],
        checkValidation,
        asyncHandler(createUser)
    );

router.route('/:id/toggle-access')
    .put(validateObjectId('id'), asyncHandler(toggleUserAccess));

router.route('/:id')
    .delete(validateObjectId('id'), asyncHandler(deleteUser));

export default router;

