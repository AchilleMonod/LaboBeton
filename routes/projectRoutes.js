import express from 'express';
import {
    getProjects,
    createProject,
    updateProject,
    deleteProject
} from '../controllers/projectController.js';
import { authenticateToken } from '../middleware/auth.js';
import validateObjectId from '../middleware/validateObjectId.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

// Protège toutes les routes de ce fichier
router.use(authenticateToken);

router.route('/')
    .get(asyncHandler(getProjects))
    .post(asyncHandler(createProject));

router.route('/:id')
    .put(validateObjectId('id'), asyncHandler(updateProject))
    .delete(validateObjectId('id'), asyncHandler(deleteProject));

export default router;

