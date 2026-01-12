import express from 'express';
import { body } from 'express-validator';

import {
    getConcreteTests,
    createConcreteTest,
    updateConcreteTest,
    deleteConcreteTest
} from '../controllers/concreteTestController.js';
import { authenticateToken } from '../middleware/auth.js';
import { checkValidation } from '../middleware/validators.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

// Protège toutes les routes de ce fichier
router.use(authenticateToken);

router.route('/')
    .get(asyncHandler(getConcreteTests))
    .post(
        [
            body('projectId', 'Un ID de projet valide est requis.').isMongoId(),
            body('specimens', 'La liste des éprouvettes doit être un tableau.').isArray()
        ],
        checkValidation,
        asyncHandler(createConcreteTest)
    );

router.route('/:id')
    .put(asyncHandler(updateConcreteTest))
    .delete(asyncHandler(deleteConcreteTest));

export default router;
