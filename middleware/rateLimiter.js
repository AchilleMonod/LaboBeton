import rateLimit from 'express-rate-limit';
import logger from '../utils/logger.js';

// Limiteur global pour la plupart des appels API
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limite chaque IP à 200 requêtes par fenêtre
  message: { message: "Trop de requêtes envoyées depuis cette IP, veuillez réessayer après 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, /*next, options*/) => {
    logger.warn(`Rate Limit dépassé pour l'IP: ${req.ip}`);
    res.status(429).json({ message: "Trop de requêtes. Veuillez patienter." });
  }
});

// Limiteur plus strict pour les routes d'authentification sensibles
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 10, // Limite chaque IP à 10 tentatives de connexion par heure
  message: { message: "Trop de tentatives de connexion. Votre accès est bloqué pour une heure." },
  standardHeaders: true,
  legacyHeaders: false,
});

export { globalLimiter, authLimiter };
