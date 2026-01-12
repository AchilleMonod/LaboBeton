import logger from './logger.js';

const errorHandler = (err, req, res, next) => {
    logger.error(err.stack);

    let statusCode = err.statusCode || 500;
    let message = err.message || "Une erreur interne du serveur est survenue.";

    // Mongoose Bad ObjectId
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        statusCode = 404;
        message = `Ressource non trouvée. ID invalide.`;
    }

    // Mongoose Duplicate Key
    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyValue);
        message = `La valeur pour le champ '${field}' existe déjà et doit être unique.`;
    }

    // Mongoose Validation Error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        const messages = Object.values(err.errors).map(val => val.message);
        message = `Données invalides : ${messages.join('. ')}`;
    }

    // JWT Errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = "Token invalide ou malformé.";
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = "Token expiré.";
    }

    res.status(statusCode).json({
        succes: false,
        erreur: message
    });
};

export default errorHandler;
