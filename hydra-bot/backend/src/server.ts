import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import 'express-async-errors';

// Utilities and middleware
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';
import { ApiError } from './utils/errors';

// Services
import { initializeWebSocket } from './services/websocket';
import { PriceService } from './services/price';
import { TradingService } from './services/trading';
import { RiskService } from './services/risk';
import { SignalService } from './services/signal';
import { TreasuryService } from './services/treasury';

// Routes
import authRoutes from './routes/auth';
import priceRoutes from './routes/prices';
import tradingRoutes from './routes/trading';
import portfolioRoutes from './routes/portfolio';
import signalRoutes from './routes/signals';
import riskRoutes from './routes/risk';
import treasuryRoutes from './routes/treasury';
import userRoutes from './routes/users';
import guildRoutes from './routes/guilds';
import achievementRoutes from './routes/achievements';
import leaderboardRoutes from './routes/leaderboard';
import chatRoutes from './routes/chat';
import analyticsRoutes from './routes/analytics';
import webhookRoutes from './routes/webhooks';

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Environment configuration
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const isDevelopment = NODE_ENV === 'development';

// Security middleware
app.use(helmet({
  contentSecurityPolicy: isDevelopment ? false : undefined,
  crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 1000 : 100, // Limit each IP
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Basic middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://same-w8d506aclf1-latest.netlify.app',
    'https://boomroach.com',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}));

// Logging
if (isDevelopment) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) }
  }));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    api: 'BoomRoach Hydra Bot API',
    version: '1.0.0',
    status: 'operational',
    timestamp: new Date().toISOString(),
    services: {
      trading: 'active',
      signals: 'active',
      risk: 'active',
      treasury: 'active',
      websocket: 'active'
    }
  });
});

// Public routes (no authentication required)
app.use('/api/auth', authRoutes);
app.use('/api/prices', priceRoutes);
app.use('/api/webhooks', webhookRoutes);

// Apply authentication middleware to protected routes
app.use('/api', authMiddleware);

// Protected API routes
app.use('/api/trading', tradingRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/signals', signalRoutes);
app.use('/api/risk', riskRoutes);
app.use('/api/treasury', treasuryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/guilds', guildRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 handler
app.use('*', (req, res) => {
  throw new ApiError(404, `Route ${req.originalUrl} not found`);
});

// Global error handler
app.use(errorHandler);

// Initialize services
let priceService: PriceService;
let tradingService: TradingService;
let riskService: RiskService;
let signalService: SignalService;
let treasuryService: TreasuryService;

async function initializeServices() {
  try {
    logger.info('Initializing Hydra Bot services...');

    // Initialize core services
    priceService = new PriceService();
    tradingService = new TradingService();
    riskService = new RiskService();
    signalService = new SignalService();
    treasuryService = new TreasuryService();

    // Start price monitoring
    await priceService.startPriceMonitoring();
    
    // Initialize WebSocket handlers
    await initializeWebSocket(io);

    // Start trading engines if enabled
    if (process.env.TRADING_ENABLED === 'true') {
      await tradingService.initialize();
      logger.info('Trading service initialized');
    }

    // Start signal monitoring
    if (process.env.AI_SIGNALS_ENABLED === 'true') {
      await signalService.startSignalGeneration();
      logger.info('Signal service initialized');
    }

    // Start risk monitoring
    await riskService.startRiskMonitoring();
    logger.info('Risk service initialized');

    // Start treasury operations
    if (process.env.TREASURY_ENABLED === 'true') {
      await treasuryService.initialize();
      logger.info('Treasury service initialized');
    }

    logger.info('All Hydra Bot services initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize services:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  
  // Stop services
  if (priceService) {
    await priceService.stop();
  }
  if (tradingService) {
    await tradingService.stop();
  }
  if (riskService) {
    await riskService.stop();
  }
  if (signalService) {
    await signalService.stop();
  }
  if (treasuryService) {
    await treasuryService.stop();
  }

  // Close server
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });

  // Force exit after 30 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  process.emit('SIGTERM');
});

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start server
async function startServer() {
  try {
    // Initialize services first
    await initializeServices();
    
    // Start HTTP server
    server.listen(PORT, () => {
      logger.info(`🚀 Hydra Bot Backend Server running on port ${PORT}`);
      logger.info(`📊 Environment: ${NODE_ENV}`);
      logger.info(`🔗 WebSocket server initialized`);
      logger.info(`📈 Trading engines: ${process.env.TRADING_ENABLED === 'true' ? 'ENABLED' : 'DISABLED'}`);
      logger.info(`🤖 AI signals: ${process.env.AI_SIGNALS_ENABLED === 'true' ? 'ENABLED' : 'DISABLED'}`);
      logger.info(`🛡️ Risk management: ENABLED`);
      logger.info(`💰 Treasury: ${process.env.TREASURY_ENABLED === 'true' ? 'ENABLED' : 'DISABLED'}`);
      
      if (isDevelopment) {
        logger.info(`🌐 API Documentation: http://localhost:${PORT}/api/docs`);
        logger.info(`💾 Database Admin: http://localhost:8080`);
        logger.info(`📊 Monitoring: http://localhost:3000`);
      }
    });

    // Handle server errors
    server.on('error', (error: any) => {
      if (error.syscall !== 'listen') {
        throw error;
      }

      const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;

      switch (error.code) {
        case 'EACCES':
          logger.error(`${bind} requires elevated privileges`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          logger.error(`${bind} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

export { app, server, io };