import express from 'express';
import {
    getCompanies,
    createCompany,
    updateCompany,
    deleteCompany
} from '../controllers/companyController.js';
import { authenticateToken } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

// Applique le middleware d'authentification à toutes les routes de ce fichier.
// Seul un utilisateur connecté peut gérer ses entreprises.
router.use(authenticateToken);

router.route('/')
    .get(asyncHandler(getCompanies))
    .post(asyncHandler(createCompany));

router.route('/:id')
    .put(asyncHandler(updateCompany))
    .delete(asyncHandler(deleteCompany));

export default router;
