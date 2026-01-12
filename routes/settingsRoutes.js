import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { authenticateToken } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

// Protège toutes les routes de ce fichier
router.use(authenticateToken);

router.route('/')
    .get(asyncHandler(getSettings))
    .put(asyncHandler(updateSettings));

export default router;
