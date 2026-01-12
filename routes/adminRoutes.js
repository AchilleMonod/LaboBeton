import express from 'express';
import {
    getBugReports,
    updateBugReportStatus,
    deleteBugReport
} from '../controllers/adminController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

// Applique l'authentification et la vérification du rôle admin à toutes les routes de ce fichier.
router.use(authenticateToken, requireAdmin);

// @route   GET /api/admin/bugs
router.get('/bugs', asyncHandler(getBugReports));

// @route   PUT /api/admin/bugs/:id
router.put('/bugs/:id', asyncHandler(updateBugReportStatus));

// @route   DELETE /api/admin/bugs/:id
router.delete('/bugs/:id', asyncHandler(deleteBugReport));

export default router;
