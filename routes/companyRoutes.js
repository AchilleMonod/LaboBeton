import express from 'express';
import sanitizeHtml from 'sanitize-html';
import {
    getCompanies,
    createCompany,
    updateCompany,
    deleteCompany
} from '../controllers/companyController.js';
import { authenticateToken } from '../middleware/auth.js';
import { isValidObjectId } from '../middleware/validators.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

// Sanitization helper function
const sanitizeInput = (input) => {
    if (input === undefined) return input;
    return sanitizeHtml(String(input), {
        allowedTags: [],
        allowedAttributes: {}
    });
};

// Apply authentication middleware to all routes
router.use(authenticateToken);

router.get('/', asyncHandler(getCompanies));
router.post('/', asyncHandler(async (req, res) => {
        // Sanitize all string inputs
        const sanitizedBody = {};
        for (const [key, value] of Object.entries(req.body)) {
            sanitizedBody[key] = typeof value === 'string' ? sanitizeInput(value) : value;
        }
        return createCompany({ ...req, body: sanitizedBody }, res);
    }));

router.put('/:id', isValidObjectId(), asyncHandler(async (req, res) => {
        // Sanitize all string inputs
        const sanitizedBody = {};
        for (const [key, value] of Object.entries(req.body)) {
            sanitizedBody[key] = typeof value === 'string' ? sanitizeInput(value) : value;
        }
        return updateCompany({ ...req, body: sanitizedBody }, res);
}));
router.delete('/:id', isValidObjectId(), asyncHandler(deleteCompany));

export default router;

