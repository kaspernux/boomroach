import express from 'express'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import { asyncHandler } from '../middleware/errorHandler'
import { ApiError } from '../utils/errors'
import { PriceService } from '../services/price'

const router = express.Router()
const prisma = new PrismaClient()

// Validation schemas
const symbolSchema = z.object({
  symbol: z.string().min(1)
})

const historySchema = z.object({
  symbol: z.string().min(1),
  hours: z.number().min(1).max(168).optional().default(24) // Max 7 days
})

/**
 * @swagger
 * /api/prices/current:
 *   get:
 *     summary: Get current prices for all tracked tokens
 *     tags: [Prices]
 *     responses:
 *       200:
 *         description: Current prices retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       symbol:
 *                         type: string
 *                       price:
 *                         type: number
 *                       change24h:
 *                         type: number
 *                       volume24h:
 *                         type: number
 *                       high24h:
 *                         type: number
 *                       low24h:
 *                         type: number
 *                       marketCap:
 *                         type: number
 *                       source:
 *                         type: string
 *       500:
 *         description: Internal server error
 */
router.get('/current', asyncHandler(async (req, res) => {
  try {
    // Get latest prices for all symbols
    const latestPrices = await prisma.$queryRaw`
      SELECT DISTINCT ON (symbol)
        symbol, price, "change24h", "volume24h", "high24h", "low24h", "marketCap", source, timestamp
      FROM "price_data"
      ORDER BY symbol, timestamp DESC
    ` as any[]

    const formattedPrices = latestPrices.map(price => ({
      symbol: price.symbol,
      price: Number(price.price),
      change24h: Number(price.change24h),
      volume24h: Number(price.volume24h),
      high24h: Number(price.high24h),
      low24h: Number(price.low24h),
      marketCap: price.marketCap ? Number(price.marketCap) : null,
      source: price.source,
      lastUpdate: price.timestamp
    }))

    res.json({
      success: true,
      data: formattedPrices,
      count: formattedPrices.length,
      lastUpdate: new Date()
    })

  } catch (error) {
    throw new ApiError(500, 'Failed to fetch current prices')
  }
}))

/**
 * @swagger
 * /api/prices/{symbol}:
 *   get:
 *     summary: Get current price for a specific token
 *     tags: [Prices]
 *     parameters:
 *       - in: path
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *         description: Token symbol (e.g., SOL/USDC)
 *     responses:
 *       200:
 *         description: Price data retrieved successfully
 *       404:
 *         description: Symbol not found
 */
router.get('/:symbol', asyncHandler(async (req, res) => {
  const { symbol } = symbolSchema.parse(req.params)

  const latestPrice = await prisma.priceData.findFirst({
    where: { symbol },
    orderBy: { timestamp: 'desc' }
  })

  if (!latestPrice) {
    throw new ApiError(404, `Price data not found for symbol: ${symbol}`)
  }

  res.json({
    success: true,
    data: {
      symbol: latestPrice.symbol,
      price: Number(latestPrice.price),
      change24h: Number(latestPrice.change24h),
      volume24h: Number(latestPrice.volume24h),
      high24h: Number(latestPrice.high24h),
      low24h: Number(latestPrice.low24h),
      marketCap: latestPrice.marketCap ? Number(latestPrice.marketCap) : null,
      source: latestPrice.source,
      lastUpdate: latestPrice.timestamp
    }
  })
}))

/**
 * @swagger
 * /api/prices/{symbol}/history:
 *   get:
 *     summary: Get price history for a specific token
 *     tags: [Prices]
 *     parameters:
 *       - in: path
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: hours
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 168
 *           default: 24
 *         description: Number of hours of history to retrieve
 *     responses:
 *       200:
 *         description: Price history retrieved successfully
 *       404:
 *         description: Symbol not found
 */
router.get('/:symbol/history', asyncHandler(async (req, res) => {
  const { symbol } = symbolSchema.parse(req.params)
  const { hours } = historySchema.parse({
    symbol,
    hours: req.query.hours ? parseInt(req.query.hours as string) : 24
  })

  const startTime = new Date(Date.now() - hours * 60 * 60 * 1000)

  const priceHistory = await prisma.priceData.findMany({
    where: {
      symbol,
      timestamp: {
        gte: startTime
      }
    },
    orderBy: { timestamp: 'asc' },
    take: 1000 // Limit results to prevent overload
  })

  if (priceHistory.length === 0) {
    throw new ApiError(404, `No price history found for symbol: ${symbol}`)
  }

  const formattedHistory = priceHistory.map(price => ({
    price: Number(price.price),
    change24h: Number(price.change24h),
    volume24h: Number(price.volume24h),
    timestamp: price.timestamp
  }))

  res.json({
    success: true,
    data: {
      symbol,
      timeframe: `${hours}h`,
      history: formattedHistory,
      count: formattedHistory.length
    }
  })
}))

/**
 * @swagger
 * /api/prices/market/summary:
 *   get:
 *     summary: Get market summary statistics
 *     tags: [Prices]
 *     responses:
 *       200:
 *         description: Market summary retrieved successfully
 */
router.get('/market/summary', asyncHandler(async (req, res) => {
  // Get latest prices for calculation
  const latestPrices = await prisma.$queryRaw`
    SELECT DISTINCT ON (symbol)
      symbol, price, "change24h", "volume24h"
    FROM "price_data"
    ORDER BY symbol, timestamp DESC
  ` as any[]

  if (latestPrices.length === 0) {
    throw new ApiError(404, 'No market data available')
  }

  // Calculate market metrics
  const totalVolume24h = latestPrices.reduce((sum, price) =>
    sum + Number(price.volume24h), 0
  )

  const avgChange24h = latestPrices.reduce((sum, price) =>
    sum + Number(price.change24h), 0
  ) / latestPrices.length

  const bullishTokens = latestPrices.filter(price =>
    Number(price.change24h) > 0
  ).length

  const bearishTokens = latestPrices.filter(price =>
    Number(price.change24h) < 0
  ).length

  const neutralTokens = latestPrices.length - bullishTokens - bearishTokens

  // Get top gainers and losers
  const sortedByChange = [...latestPrices].sort((a, b) =>
    Number(b.change24h) - Number(a.change24h)
  )

  const topGainers = sortedByChange.slice(0, 3).map(price => ({
    symbol: price.symbol,
    price: Number(price.price),
    change24h: Number(price.change24h)
  }))

  const topLosers = sortedByChange.slice(-3).reverse().map(price => ({
    symbol: price.symbol,
    price: Number(price.price),
    change24h: Number(price.change24h)
  }))

  res.json({
    success: true,
    data: {
      totalVolume24h,
      avgChange24h,
      marketSentiment: {
        bullish: bullishTokens,
        bearish: bearishTokens,
        neutral: neutralTokens,
        bullishPercentage: (bullishTokens / latestPrices.length) * 100
      },
      topGainers,
      topLosers,
      totalTokens: latestPrices.length,
      lastUpdate: new Date()
    }
  })
}))

/**
 * @swagger
 * /api/prices/trading-pairs:
 *   get:
 *     summary: Get all available trading pairs
 *     tags: [Prices]
 *     responses:
 *       200:
 *         description: Trading pairs retrieved successfully
 */
router.get('/trading-pairs', asyncHandler(async (req, res) => {
  const symbols = await prisma.priceData.findMany({
    select: { symbol: true },
    distinct: ['symbol']
  })

  const pairs = symbols.map(s => s.symbol)

  res.json({
    success: true,
    data: {
      pairs,
      count: pairs.length
    }
  })
}))

/**
 * @swagger
 * /api/prices/alerts:
 *   post:
 *     summary: Create a price alert
 *     tags: [Prices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - symbol
 *               - targetPrice
 *               - condition
 *             properties:
 *               symbol:
 *                 type: string
 *               targetPrice:
 *                 type: number
 *               condition:
 *                 type: string
 *                 enum: [above, below]
 *     responses:
 *       201:
 *         description: Price alert created successfully
 *       400:
 *         description: Invalid input
 */
router.post('/alerts', asyncHandler(async (req, res) => {
  // This would be implemented with user authentication
  // For now, return a success response

  const alertSchema = z.object({
    symbol: z.string().min(1),
    targetPrice: z.number().positive(),
    condition: z.enum(['above', 'below'])
  })

  const { symbol, targetPrice, condition } = alertSchema.parse(req.body)

  // In a real implementation, this would store the alert in the database
  // and check against it during price updates

  res.status(201).json({
    success: true,
    message: 'Price alert created successfully',
    data: {
      id: `alert_${Date.now()}`,
      symbol,
      targetPrice,
      condition,
      createdAt: new Date()
    }
  })
}))

/**
 * @swagger
 * /api/prices/ws-stats:
 *   get:
 *     summary: Get WebSocket subscription statistics
 *     tags: [Prices]
 *     responses:
 *       200:
 *         description: WebSocket stats retrieved successfully
 */
router.get('/ws-stats', asyncHandler(async (req, res) => {
  // This would get actual stats from the WebSocket service
  // For now, return mock data

  res.json({
    success: true,
    data: {
      activeConnections: 47,
      subscriptionsBySymbol: {
        'BOOMROACH/SOL': 23,
        'SOL/USDC': 31,
        'ETH/USDC': 18,
        'BTC/USDC': 25
      },
      totalSubscriptions: 97,
      lastUpdate: new Date()
    }
  })
}))

export default router
