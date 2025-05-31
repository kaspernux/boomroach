import express from 'express'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import { PublicKey, Connection, Transaction } from '@solana/web3.js'
import axios from 'axios'
import { asyncHandler } from '../middleware/errorHandler'
import { ApiError, TradingError, BlockchainError } from '../utils/errors'
import { logger } from '../utils/logger'
import { AuthenticatedRequest } from '../middleware/auth'

const router = express.Router()
const prisma = new PrismaClient()

// Solana connection
const connection = new Connection(
  process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
  'confirmed'
)

// Validation schemas
const tradeExecutionSchema = z.object({
  token: z.string().min(1),
  action: z.enum(['BUY', 'SELL']),
  amount: z.number().positive(),
  slippage: z.number().min(0.1).max(50).optional().default(1),
  strategy: z.enum(['MANUAL', 'SNIPER', 'REENTRY', 'AI_SIGNAL']).optional().default('MANUAL')
})

const configUpdateSchema = z.object({
  isActive: z.boolean().optional(),
  riskLevel: z.enum(['conservative', 'moderate', 'aggressive']).optional(),
  maxTradeAmount: z.number().positive().optional(),
  maxDailyLoss: z.number().positive().optional(),
  autoSniper: z.boolean().optional(),
  autoReentry: z.boolean().optional(),
  stopLossPercentage: z.number().min(1).max(50).optional(),
  takeProfitPercentage: z.number().min(5).max(100).optional(),
  enabledTokens: z.array(z.string()).optional(),
  telegramNotifications: z.boolean().optional()
})

const signalRequestSchema = z.object({
  token: z.string().min(1),
  timeframe: z.enum(['1m', '5m', '15m', '1h', '4h', '1d']).optional().default('15m')
})

/**
 * @swagger
 * /api/trading/portfolio:
 *   get:
 *     summary: Get user's trading portfolio
 *     tags: [Trading]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Portfolio retrieved successfully
 */
router.get('/portfolio', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id

  // Get user's portfolio
  let portfolio = await prisma.portfolio.findUnique({
    where: { userId }
  })

  if (!portfolio) {
    // Create default portfolio
    portfolio = await prisma.portfolio.create({
      data: {
        userId,
        totalValue: 0,
        totalPnL: 0,
        totalPnLPercent: 0,
        positions: []
      }
    })
  }

  // Get recent trades
  const trades = await prisma.trade.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 10
  })

  // Calculate performance metrics
  const performanceMetrics = await calculatePerformanceMetrics(userId)

  // Get current positions (from portfolio JSON)
  const positions = portfolio.positions as any[] || []

  res.json({
    success: true,
    portfolio: {
      totalValue: portfolio.totalValue,
      totalPnL: portfolio.totalPnL,
      totalPnLPercentage: portfolio.totalPnLPercent,
      dailyPnL: performanceMetrics.dailyPnL,
      weeklyPnL: performanceMetrics.weeklyPnL,
      monthlyPnL: performanceMetrics.monthlyPnL,
      positions,
      trades: trades.map(trade => ({
        id: trade.id,
        token: trade.symbol,
        type: trade.side,
        amount: trade.amount,
        price: trade.price,
        value: trade.amount * trade.price,
        fee: trade.fees,
        pnl: trade.pnl,
        status: trade.status,
        signature: trade.signature,
        timestamp: trade.createdAt,
        strategy: trade.source
      })),
      performance: performanceMetrics.performance
    }
  })
}))

/**
 * @swagger
 * /api/trading/execute:
 *   post:
 *     summary: Execute a trade
 *     tags: [Trading]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - action
 *               - amount
 *             properties:
 *               token:
 *                 type: string
 *               action:
 *                 type: string
 *                 enum: [BUY, SELL]
 *               amount:
 *                 type: number
 *               slippage:
 *                 type: number
 *               strategy:
 *                 type: string
 *                 enum: [MANUAL, SNIPER, REENTRY, AI_SIGNAL]
 *     responses:
 *       200:
 *         description: Trade executed successfully
 */
router.post('/execute', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id
  const validatedData = tradeExecutionSchema.parse(req.body)
  const { token, action, amount, slippage, strategy } = validatedData

  try {
    // Check user's configuration and limits
    await validateTradingLimits(userId, amount)

    // Get current price from Jupiter API
    const currentPrice = await getCurrentPrice(token)
    if (!currentPrice) {
      throw new TradingError('Unable to fetch current price', token, action)
    }

    // Calculate trade value
    const tradeValue = amount * currentPrice

    // Get optimal route from Jupiter
    const route = await getJupiterRoute(token, action, amount, slippage)
    if (!route) {
      throw new TradingError('No available trading route', token, action)
    }

    // Execute trade through Jupiter
    const executionResult = await executeJupiterTrade(route, req.user!.walletAddress)

    // Record trade in database
    const trade = await prisma.trade.create({
      data: {
        userId,
        symbol: token,
        type: action === 'BUY' ? 'MARKET' : 'MARKET',
        side: action,
        amount,
        price: currentPrice,
        executedPrice: executionResult.executedPrice,
        status: executionResult.success ? 'FILLED' : 'FAILED',
        fees: executionResult.fees,
        signature: executionResult.signature,
        source: strategy,
        metadata: {
          slippage,
          route: route.routeId,
          jupiterData: executionResult.jupiterData
        }
      }
    })

    // Update portfolio
    await updatePortfolio(userId, trade)

    // Update user stats
    await updateUserStats(userId, trade)

    res.json({
      success: true,
      trade: {
        id: trade.id,
        token: trade.symbol,
        type: trade.side,
        amount: trade.amount,
        price: trade.executedPrice || trade.price,
        value: tradeValue,
        fee: trade.fees,
        status: trade.status,
        signature: trade.signature,
        timestamp: trade.createdAt,
        strategy: trade.source
      },
      executionDetails: executionResult
    })

  } catch (error) {
    logger.error('Trade execution failed', {
      userId,
      token,
      action,
      amount,
      error: error.message
    })
    throw error
  }
}))

/**
 * @swagger
 * /api/trading/signals:
 *   post:
 *     summary: Get AI trading signals
 *     tags: [Trading]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *               timeframe:
 *                 type: string
 *                 enum: [1m, 5m, 15m, 1h, 4h, 1d]
 *     responses:
 *       200:
 *         description: Trading signals generated
 */
router.post('/signals', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const validatedData = signalRequestSchema.parse(req.body)
  const { token, timeframe } = validatedData

  try {
    // Get market data
    const marketData = await getMarketData(token, timeframe)

    // Generate AI signal
    const signal = await generateAISignal(token, marketData)

    // Store signal for tracking
    await storeSignal(req.user!.id, signal)

    res.json({
      success: true,
      signal: {
        id: signal.id,
        token,
        action: signal.action,
        confidence: signal.confidence,
        price: signal.price,
        reasoning: signal.reasoning,
        timestamp: signal.timestamp,
        aiScore: signal.aiScore,
        riskLevel: signal.riskLevel,
        expectedProfit: signal.expectedProfit,
        liquidityScore: signal.liquidityScore
      }
    })

  } catch (error) {
    logger.error('Signal generation failed', {
      token,
      timeframe,
      error: error.message
    })
    throw new ApiError(500, 'Failed to generate trading signal')
  }
}))

/**
 * @swagger
 * /api/trading/config:
 *   get:
 *     summary: Get user's trading configuration
 *     tags: [Trading]
 *     security:
 *       - bearerAuth: []
 */
router.get('/config', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id

  // Get or create trading config
  let config = await prisma.systemConfig.findUnique({
    where: { key: `trading_config_${userId}` }
  })

  if (!config) {
    const defaultConfig = {
      isActive: false,
      riskLevel: 'moderate',
      maxTradeAmount: 100,
      maxDailyLoss: 50,
      autoSniper: false,
      autoReentry: false,
      stopLossPercentage: 10,
      takeProfitPercentage: 25,
      enabledTokens: [],
      telegramNotifications: true
    }

    config = await prisma.systemConfig.create({
      data: {
        key: `trading_config_${userId}`,
        value: defaultConfig
      }
    })
  }

  res.json({
    success: true,
    config: config.value
  })
}))

/**
 * @swagger
 * /api/trading/config:
 *   put:
 *     summary: Update user's trading configuration
 *     tags: [Trading]
 *     security:
 *       - bearerAuth: []
 */
router.put('/config', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id
  const validatedData = configUpdateSchema.parse(req.body)

  // Get current config
  const currentConfig = await prisma.systemConfig.findUnique({
    where: { key: `trading_config_${userId}` }
  })

  const updatedConfig = {
    ...(currentConfig?.value as any || {}),
    ...validatedData
  }

  // Update config
  await prisma.systemConfig.upsert({
    where: { key: `trading_config_${userId}` },
    update: { value: updatedConfig },
    create: {
      key: `trading_config_${userId}`,
      value: updatedConfig
    }
  })

  res.json({
    success: true,
    config: updatedConfig
  })
}))

/**
 * @swagger
 * /api/trading/history:
 *   get:
 *     summary: Get trading history
 *     tags: [Trading]
 *     security:
 *       - bearerAuth: []
 */
router.get('/history', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id
  const limit = parseInt(req.query.limit as string) || 50
  const offset = parseInt(req.query.offset as string) || 0

  const trades = await prisma.trade.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset
  })

  const totalTrades = await prisma.trade.count({
    where: { userId }
  })

  res.json({
    success: true,
    trades: trades.map(trade => ({
      id: trade.id,
      token: trade.symbol,
      type: trade.side,
      amount: trade.amount,
      price: trade.executedPrice || trade.price,
      value: trade.amount * (trade.executedPrice || trade.price),
      fee: trade.fees,
      pnl: trade.pnl,
      status: trade.status,
      signature: trade.signature,
      timestamp: trade.createdAt,
      strategy: trade.source
    })),
    pagination: {
      total: totalTrades,
      limit,
      offset,
      hasMore: offset + limit < totalTrades
    }
  })
}))

/**
 * @swagger
 * /api/trading/analytics:
 *   get:
 *     summary: Get trading analytics
 *     tags: [Trading]
 *     security:
 *       - bearerAuth: []
 */
router.get('/analytics', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id

  const analytics = await generateTradingAnalytics(userId)

  res.json({
    success: true,
    analytics
  })
}))

// Helper functions

async function validateTradingLimits(userId: string, amount: number): Promise<void> {
  // Get user config
  const config = await prisma.systemConfig.findUnique({
    where: { key: `trading_config_${userId}` }
  })

  const userConfig = config?.value as any || {}

  // Check max trade amount
  if (amount > (userConfig.maxTradeAmount || 1000)) {
    throw new TradingError(`Trade amount exceeds maximum limit of $${userConfig.maxTradeAmount}`)
  }

  // Check daily loss limit
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const dailyTrades = await prisma.trade.findMany({
    where: {
      userId,
      createdAt: { gte: todayStart },
      status: 'FILLED'
    }
  })

  const dailyLoss = dailyTrades
    .filter(trade => trade.pnl < 0)
    .reduce((sum, trade) => sum + Math.abs(trade.pnl), 0)

  if (dailyLoss >= (userConfig.maxDailyLoss || 100)) {
    throw new TradingError('Daily loss limit reached')
  }
}

async function getCurrentPrice(token: string): Promise<number | null> {
  try {
    const response = await axios.get(`https://price.jup.ag/v4/price?ids=${token}`)
    return response.data.data[token]?.price || null
  } catch (error) {
    logger.error('Failed to fetch price', { token, error: error.message })
    return null
  }
}

async function getJupiterRoute(token: string, action: string, amount: number, slippage: number): Promise<any> {
  try {
    // This would integrate with Jupiter API for route optimization
    // For now, return mock route
    return {
      routeId: `route_${Date.now()}`,
      inputMint: action === 'BUY' ? 'USDC' : token,
      outputMint: action === 'BUY' ? token : 'USDC',
      amount,
      slippage,
      priceImpact: Math.random() * 2,
      estimatedOutput: amount * (1 - slippage / 100)
    }
  } catch (error) {
    logger.error('Failed to get Jupiter route', { token, action, error: error.message })
    return null
  }
}

async function executeJupiterTrade(route: any, walletAddress: string): Promise<any> {
  try {
    // This would execute the actual trade through Jupiter
    // For now, return mock execution result
    const success = Math.random() > 0.1 // 90% success rate

    return {
      success,
      executedPrice: route.amount * (1 + (Math.random() - 0.5) * 0.01), // ±0.5% price variation
      fees: route.amount * 0.005, // 0.5% fee
      signature: success ? `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : null,
      jupiterData: {
        route: route.routeId,
        priceImpact: route.priceImpact,
        slippage: route.slippage
      }
    }
  } catch (error) {
    logger.error('Failed to execute Jupiter trade', { route, error: error.message })
    throw new BlockchainError('Trade execution failed')
  }
}

async function getMarketData(token: string, timeframe: string): Promise<any> {
  // Mock market data - would integrate with real data sources
  return {
    price: Math.random() * 100,
    volume24h: Math.random() * 1000000,
    change24h: (Math.random() - 0.5) * 20,
    liquidityScore: Math.floor(Math.random() * 100),
    holders: Math.floor(Math.random() * 10000),
    socialScore: Math.floor(Math.random() * 100)
  }
}

async function generateAISignal(token: string, marketData: any): Promise<any> {
  // Mock AI signal generation - would integrate with OpenAI/ML models
  const actions = ['BUY', 'SELL', 'HOLD']
  const action = actions[Math.floor(Math.random() * actions.length)]
  const confidence = Math.floor(Math.random() * 40) + 60 // 60-100%

  return {
    id: `signal_${Date.now()}`,
    action,
    confidence,
    price: marketData.price,
    reasoning: generateSignalReasoning(action, confidence, marketData),
    timestamp: new Date(),
    aiScore: confidence,
    riskLevel: confidence > 85 ? 'LOW' : confidence > 70 ? 'MEDIUM' : 'HIGH',
    expectedProfit: Math.random() * 30 + 5, // 5-35%
    liquidityScore: marketData.liquidityScore
  }
}

function generateSignalReasoning(action: string, confidence: number, marketData: any): string {
  const reasons = {
    BUY: [
      'Strong upward momentum detected with high volume',
      'AI pattern recognition indicates bullish trend',
      'Social sentiment analysis shows positive indicators',
      'Technical analysis suggests oversold conditions'
    ],
    SELL: [
      'Resistance level reached with declining volume',
      'AI detects potential reversal pattern',
      'Risk management suggests profit taking',
      'Technical indicators show overbought conditions'
    ],
    HOLD: [
      'Market consolidation phase detected',
      'Mixed signals require patience',
      'Current price within fair value range',
      'Waiting for clearer directional signals'
    ]
  }

  return reasons[action as keyof typeof reasons][Math.floor(Math.random() * 4)]
}

async function storeSignal(userId: string, signal: any): Promise<void> {
  // Store signal for tracking and analysis
  await prisma.systemConfig.create({
    data: {
      key: `signal_${signal.id}`,
      value: {
        userId,
        ...signal
      }
    }
  })
}

async function updatePortfolio(userId: string, trade: any): Promise<void> {
  // Update user's portfolio based on trade
  const portfolio = await prisma.portfolio.findUnique({
    where: { userId }
  })

  if (portfolio) {
    const currentPositions = portfolio.positions as any[] || []
    // Update positions logic would go here

    await prisma.portfolio.update({
      where: { userId },
      data: {
        totalValue: portfolio.totalValue + trade.pnl,
        totalPnL: portfolio.totalPnL + trade.pnl,
        lastUpdated: new Date()
      }
    })
  }
}

async function updateUserStats(userId: string, trade: any): Promise<void> {
  // Update user's trading statistics
  await prisma.user.update({
    where: { id: userId },
    data: {
      totalTrades: { increment: 1 },
      totalPnL: { increment: trade.pnl }
    }
  })
}

async function calculatePerformanceMetrics(userId: string): Promise<any> {
  const now = new Date()
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [dailyTrades, weeklyTrades, monthlyTrades, allTrades] = await Promise.all([
    prisma.trade.findMany({
      where: { userId, createdAt: { gte: dayStart }, status: 'FILLED' }
    }),
    prisma.trade.findMany({
      where: { userId, createdAt: { gte: weekStart }, status: 'FILLED' }
    }),
    prisma.trade.findMany({
      where: { userId, createdAt: { gte: monthStart }, status: 'FILLED' }
    }),
    prisma.trade.findMany({
      where: { userId, status: 'FILLED' }
    })
  ])

  const calculatePnL = (trades: any[]) => trades.reduce((sum, trade) => sum + trade.pnl, 0)
  const calculateWinRate = (trades: any[]) => {
    const profitable = trades.filter(trade => trade.pnl > 0).length
    return trades.length > 0 ? (profitable / trades.length) * 100 : 0
  }

  return {
    dailyPnL: calculatePnL(dailyTrades),
    weeklyPnL: calculatePnL(weeklyTrades),
    monthlyPnL: calculatePnL(monthlyTrades),
    performance: {
      totalTrades: allTrades.length,
      successfulTrades: allTrades.filter(trade => trade.pnl > 0).length,
      winRate: calculateWinRate(allTrades),
      avgProfitPerTrade: allTrades.length > 0 ? calculatePnL(allTrades) / allTrades.length : 0,
      bestTrade: Math.max(...allTrades.map(trade => trade.pnl), 0),
      worstTrade: Math.min(...allTrades.map(trade => trade.pnl), 0),
      sharpeRatio: 1.5, // Mock calculation
      maxDrawdown: 15.2, // Mock calculation
      profitFactor: 2.3 // Mock calculation
    }
  }
}

async function generateTradingAnalytics(userId: string): Promise<any> {
  const trades = await prisma.trade.findMany({
    where: { userId, status: 'FILLED' },
    orderBy: { createdAt: 'desc' },
    take: 100
  })

  // Generate analytics
  return {
    summary: {
      totalTrades: trades.length,
      totalPnL: trades.reduce((sum, trade) => sum + trade.pnl, 0),
      winRate: trades.length > 0 ? (trades.filter(trade => trade.pnl > 0).length / trades.length) * 100 : 0,
      avgTradeSize: trades.length > 0 ? trades.reduce((sum, trade) => sum + trade.amount, 0) / trades.length : 0
    },
    byStrategy: {
      MANUAL: trades.filter(trade => trade.source === 'MANUAL').length,
      SNIPER: trades.filter(trade => trade.source === 'SNIPER').length,
      REENTRY: trades.filter(trade => trade.source === 'REENTRY').length,
      AI_SIGNAL: trades.filter(trade => trade.source === 'AI_SIGNAL').length
    },
    timeDistribution: {
      // Mock time-based analysis
      morning: Math.floor(Math.random() * 20),
      afternoon: Math.floor(Math.random() * 20),
      evening: Math.floor(Math.random() * 20),
      night: Math.floor(Math.random() * 20)
    }
  }
}

export default router
