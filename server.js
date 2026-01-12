import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import logger from './utils/logger.js';
import errorHandler from './utils/errorHandler.js';
import { globalLimiter } from './middleware/rateLimiter.js';
import User from './models/User.js'; // Requis pour le seeding
import bcrypt from 'bcryptjs';     // Requis pour le seeding

// Importation des routeurs
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import concreteTestRoutes from './routes/concreteTestRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import bugRoutes from './routes/bugRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// --- Initialisation ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 8080;
let server;

// --- Middlewares de Sécurité & Configuration Globale ---
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  logger.error("🚨 ALERTE SÉCURITÉ CRITIQUE : JWT_SECRET n'est pas défini en production.");
  process.exit(1);
}

app.set('trust proxy', 1); // Nécessaire pour les rate limiters derrière un proxy

// Redirection HTTP vers HTTPS en production
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
});

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:8080',
  process.env.FRONTEND_URL 
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Autorise les requêtes sans origine (ex: Postman) et celles de la liste blanche
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Non autorisé par CORS'));
    }
  },
  credentials: true
}));

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "script-src": ["'self'", "'unsafe-inline'"], // À ajuster si vous utilisez des CDN
      "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      "font-src": ["'self'", "https://fonts.gstatic.com"],
      "img-src": ["'self'", "data:", "blob:"],
    },
  },
}));
app.use(express.json({ limit: '5mb' })); // Augmentation limite pour les logos en base64
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(mongoSanitize({ replaceWith: '_' }));


// --- Connexion à la base de données ---
const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        logger.warn("⚠️ MONGO_URI manquant. Le serveur fonctionne en mode hors-ligne.");
        return;
    }
    await mongoose.connect(uri, { dbName: 'labobeton' });
    logger.info(`✅ MongoDB Connecté`);
    await seedAdminUser();
  } catch (error) {
    logger.error(`❌ Erreur de connexion à MongoDB : ${error.message}`);
    process.exit(1);
  }
};

// --- Création de l'utilisateur admin initial ---
const seedAdminUser = async () => {
  try {
    const count = await User.countDocuments();
    if (count === 0) {
      const initUser = process.env.INIT_ADMIN_USERNAME;
      const initPass = process.env.INIT_ADMIN_PASSWORD;
      if (initUser && initPass) {
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(initPass, salt);
        await User.create({ 
          username: initUser, 
          password: hashed, 
          role: 'admin', 
          companyName: 'ADMIN SYSTEM',
          tokenVersion: 0
        });
        logger.info(`✅ Compte Administrateur initial créé.`);
      }
    }
  } catch (error) { 
    logger.error("Erreur lors de la création de l'admin initial :", error); 
  }
};

// --- Montage des Routes de l'API ---
app.use('/api', globalLimiter); // Applique le rate limiter global à toutes les routes API

app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const status = dbState === 1 ? 'CONNECTED' : 'DISCONNECTED';
  if (status === 'DISCONNECTED') {
      return res.status(503).json({ status, timestamp: new Date(), dbState });
  }
  res.status(200).json({ status, timestamp: new Date(), uptime: process.uptime() });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/concrete-tests', concreteTestRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/bugs', bugRoutes);
app.use('/api/admin', adminRoutes);


// --- Service du Frontend en Production ---
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
}

// --- Gestionnaire d'Erreurs Global ---
// Doit être le dernier middleware enregistré
app.use(errorHandler);

// --- Démarrage du Serveur & Arrêt Gracieux ---
server = app.listen(PORT, () => {
  logger.info(`🚀 Serveur LaboBéton démarré sur le port ${PORT}`);
  connectDB();
});

const gracefulShutdown = () => {
  logger.info('🔄 SIGTERM reçu. Arrêt gracieux du serveur...');
  server.close(() => {
    logger.info('🛑 Serveur HTTP fermé.');
    mongoose.connection.close(false).then(() => {
        logger.info('zzZ Connexion MongoDB fermée.');
        process.exit(0);
    });
  });
  
  // Timeout pour forcer la fermeture si l'arrêt gracieux échoue
  setTimeout(() => {
      logger.error("L'arrêt gracieux a échoué dans le temps imparti, fermeture forcée.");
      process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// --- Hack pour masquer un avertissement de dépréciation ---
const originalEmitWarning = process.emitWarning;
process.emitWarning = (warning, ...args) => {
  if (typeof warning === 'string' && warning.includes('util._extend')) return;
  if (warning && typeof warning === 'object' && warning.message && warning.message.includes('util._extend')) return;
  return originalEmitWarning.call(process, warning, ...args);
};