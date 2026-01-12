import express from 'express';
import { createBugReport } from '../controllers/bugController.js';
import { authenticateToken } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

// @route   POST /api/bugs
// Permet à tout utilisateur authentifié de soumettre un rapport de bug.
router.post('/', authenticateToken, asyncHandler(createBugReport));

export default router;
