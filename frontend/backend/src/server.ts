import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import 'express-async-errors'

// Import routes
import authRoutes from './routes/auth'
import userRoutes from './routes/users'
import tradingRoutes from './routes/trading'
import guildRoutes from './routes/guilds'
import questRoutes from './routes/quests'
import achievementRoutes from './routes/achievements'
import socialRoutes from './routes/social'
import priceRoutes from './routes/prices'
import adminRoutes from './routes/admin'

// Import middleware
import { authenticateToken } from './middleware/auth'
import { errorHandler } from './middleware/errorHandler'
import { logger } from './utils/logger'

// Import services
import { WebSocketService } from './services/websocket'
import { PriceService } from './services/price'
import { QuestService } from './services/quest'
import { AchievementService } from './services/achievement'

// Load environment variables
dotenv.config()

// Initialize Prisma
export const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

// Create Express app
const app = express()
const server = createServer(app)

// Initialize Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
})

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BoomRoach 2025 API',
      version: '1.0.0',
      description: 'Advanced trading platform with gamification features',
      contact: {
        name: 'BoomRoach Team',
        email: 'api@boomroach.com'
      }
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3001',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/routes/*.ts', './src/types/*.ts']
}

const specs = swaggerJsdoc(swaggerOptions)

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:", "ws:"]
    }
  }
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.'
  }
})

// Apply rate limiting
app.use('/api/', limiter)
app.use('/api/auth', authLimiter)

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
}))

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Compression middleware
app.use(compression())

// Logging middleware
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim())
  }
}))

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'BoomRoach API Documentation'
}))

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', authenticateToken, userRoutes)
app.use('/api/trading', authenticateToken, tradingRoutes)
app.use('/api/guilds', authenticateToken, guildRoutes)
app.use('/api/quests', authenticateToken, questRoutes)
app.use('/api/achievements', authenticateToken, achievementRoutes)
app.use('/api/social', authenticateToken, socialRoutes)
app.use('/api/prices', priceRoutes)
app.use('/api/admin', authenticateToken, adminRoutes)

// WebSocket handling
io.use((socket, next) => {
  // Add authentication middleware for WebSocket connections
  const token = socket.handshake.auth.token
  if (!token) {
    return next(new Error('Authentication error'))
  }

  // Verify JWT token here
  // For now, we'll skip validation in development
  next()
})

// Initialize WebSocket service
const webSocketService = new WebSocketService(io)

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`)

  webSocketService.handleConnection(socket)

  socket.on('disconnect', (reason) => {
    logger.info(`Client disconnected: ${socket.id}, reason: ${reason}`)
    webSocketService.handleDisconnection(socket)
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The requested endpoint ${req.originalUrl} does not exist.`,
    availableEndpoints: [
      '/api/auth',
      '/api/users',
      '/api/trading',
      '/api/guilds',
      '/api/quests',
      '/api/achievements',
      '/api/social',
      '/api/prices',
      '/api/admin',
      '/api-docs',
      '/health'
    ]
  })
})

// Error handling middleware (must be last)
app.use(errorHandler)

const PORT = process.env.PORT || 3001

// Start server
async function startServer() {
  try {
    // Connect to database
    await prisma.$connect()
    logger.info('Connected to database')

    // Initialize services
    const priceService = new PriceService(prisma, webSocketService)
    const questService = new QuestService(prisma)
    const achievementService = new AchievementService(prisma)

    // Start background services
    await priceService.startPriceUpdates()
    await questService.startQuestProcessing()
    await achievementService.startAchievementProcessing()

    server.listen(PORT, () => {
      logger.info(`🚀 BoomRoach API server running on port ${PORT}`)
      logger.info(`📚 API Documentation available at http://localhost:${PORT}/api-docs`)
      logger.info(`🏥 Health check available at http://localhost:${PORT}/health`)
      logger.info(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`)
    })

  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...')

  server.close(() => {
    logger.info('HTTP server closed')
  })

  await prisma.$disconnect()
  logger.info('Database connection closed')

  process.exit(0)
})

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...')

  server.close(() => {
    logger.info('HTTP server closed')
  })

  await prisma.$disconnect()
  logger.info('Database connection closed')

  process.exit(0)
})

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

// Export for testing
export { app, server, io }

// Start the server
if (require.main === module) {
  startServer()
}
