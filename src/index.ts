import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import winston from 'winston';
import uAssetRoutes from './routes/uasset';
import { BlockchainManager } from './managers/BlockchainManager';
import { UAssetService } from './services/UAssetService';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'uasset-backend' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });
  next();
});

const blockchainManager = new BlockchainManager();
const uAssetService = new UAssetService(blockchainManager);

app.locals.blockchainManager = blockchainManager;
app.locals.uAssetService = uAssetService;

app.use('/api/v1/uasset', uAssetRoutes);

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    version: '1.0.0',
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'uAsset Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      uasset: '/api/v1/uasset',
    },
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    timestamp: new Date(),
  });
});

app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    timestamp: new Date(),
  });
});

app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
