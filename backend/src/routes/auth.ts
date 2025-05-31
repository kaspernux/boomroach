import express from 'express'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { PublicKey } from '@solana/web3.js'
import nacl from 'tweetnacl'
import bs58 from 'bs58'
import { PrismaClient } from '@prisma/client'
import { asyncHandler } from '../middleware/errorHandler'
import { ApiError, ValidationError, AuthenticationError } from '../utils/errors'
import { logger } from '../utils/logger'

const router = express.Router()
const prisma = new PrismaClient()

// Validation schemas
const walletAuthSchema = z.object({
  walletAddress: z.string().min(32).max(44),
  signature: z.string(),
  message: z.string(),
  publicKey: z.string().optional()
})

const verifyEmailSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6)
})

const updateProfileSchema = z.object({
  username: z.string().min(3).max(20).optional(),
  email: z.string().email().optional(),
  avatar: z.string().url().optional()
})

/**
 * @swagger
 * /api/auth/wallet:
 *   post:
 *     summary: Authenticate with Solana wallet
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - walletAddress
 *               - signature
 *               - message
 *             properties:
 *               walletAddress:
 *                 type: string
 *                 description: Base58 encoded wallet address
 *               signature:
 *                 type: string
 *                 description: Base58 encoded signature
 *               message:
 *                 type: string
 *                 description: Message that was signed
 *               publicKey:
 *                 type: string
 *                 description: Base58 encoded public key
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                 isNewUser:
 *                   type: boolean
 *       400:
 *         description: Invalid signature or wallet address
 *       500:
 *         description: Internal server error
 */
router.post('/wallet', asyncHandler(async (req, res) => {
  const validatedData = walletAuthSchema.parse(req.body)
  const { walletAddress, signature, message, publicKey } = validatedData

  try {
    // Verify the signature
    const isValidSignature = await verifyWalletSignature(
      walletAddress,
      signature,
      message,
      publicKey
    )

    if (!isValidSignature) {
      throw new AuthenticationError('Invalid wallet signature')
    }

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { walletAddress },
      include: {
        achievements: {
          include: {
            achievement: true
          }
        },
        guildMember: {
          include: {
            guild: true
          }
        }
      }
    })

    let isNewUser = false

    if (!user) {
      // Create new user
      const username = await generateUniqueUsername(walletAddress)

      user = await prisma.user.create({
        data: {
          walletAddress,
          username,
          publicKey: publicKey || walletAddress,
          level: 1,
          experience: 0,
          lastLoginAt: new Date()
        },
        include: {
          achievements: {
            include: {
              achievement: true
            }
          },
          guildMember: {
            include: {
              guild: true
            }
          }
        }
      })

      // Award new user achievements
      await awardNewUserAchievements(user.id)
      isNewUser = true

      logger.info('New user registered', {
        userId: user.id,
        walletAddress,
        username: user.username
      })
    } else {
      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      })
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        walletAddress: user.walletAddress,
        level: user.level
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    // Create session
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    })

    // Return user data without sensitive information
    const userResponse = {
      id: user.id,
      username: user.username,
      walletAddress: user.walletAddress,
      avatar: user.avatar,
      level: user.level,
      experience: user.experience,
      isVerified: user.isVerified,
      isAdmin: user.isAdmin,
      achievements: user.achievements.map(ua => ({
        id: ua.achievement.id,
        title: ua.achievement.title,
        icon: ua.achievement.icon,
        unlockedAt: ua.unlockedAt
      })),
      guild: user.guildMember ? {
        id: user.guildMember.guild.id,
        name: user.guildMember.guild.name,
        role: user.guildMember.role
      } : null,
      createdAt: user.createdAt
    }

    res.json({
      success: true,
      token,
      user: userResponse,
      isNewUser
    })

  } catch (error) {
    logger.error('Wallet authentication failed', {
      walletAddress,
      error: error.message
    })
    throw error
  }
}))

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh authentication token
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid or expired token
 */
router.post('/refresh', asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    throw new AuthenticationError('No token provided')
  }

  try {
    // Verify current token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any

    // Check if session exists
    const session = await prisma.session.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            walletAddress: true,
            level: true,
            isAdmin: true,
            isVerified: true,
            isBanned: true
          }
        }
      }
    })

    if (!session || session.user.isBanned) {
      throw new AuthenticationError('Invalid session')
    }

    // Generate new token
    const newToken = jwt.sign(
      {
        userId: session.user.id,
        walletAddress: session.user.walletAddress,
        level: session.user.level
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    // Update session
    await prisma.session.update({
      where: { id: session.id },
      data: {
        token: newToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    })

    res.json({
      success: true,
      token: newToken,
      user: session.user
    })

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AuthenticationError('Invalid token')
    }
    throw error
  }
}))

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout and invalidate session
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post('/logout', asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1]

  if (token) {
    try {
      // Delete session
      await prisma.session.deleteMany({
        where: { token }
      })
    } catch (error) {
      // Log error but don't fail logout
      logger.warn('Error deleting session during logout', { error: error.message })
    }
  }

  res.json({ success: true, message: 'Logged out successfully' })
}))

/**
 * @swagger
 * /api/auth/verify-email:
 *   post:
 *     summary: Verify email address with code
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               code:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 6
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid verification code
 */
router.post('/verify-email', asyncHandler(async (req, res) => {
  // This would integrate with an email service like SendGrid or AWS SES
  // For now, we'll accept any 6-digit code starting with "123"
  const { email, code } = verifyEmailSchema.parse(req.body)

  if (!code.startsWith('123')) {
    throw new ValidationError('Invalid verification code')
  }

  res.json({
    success: true,
    message: 'Email verified successfully'
  })
}))

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved
 *       401:
 *         description: Not authenticated
 */
router.get('/me', asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    throw new AuthenticationError('No token provided')
  }

  const session = await prisma.session.findUnique({
    where: { token },
    include: {
      user: {
        include: {
          achievements: {
            where: { isUnlocked: true },
            include: {
              achievement: true
            }
          },
          guildMember: {
            include: {
              guild: true
            }
          },
          portfolio: true
        }
      }
    }
  })

  if (!session) {
    throw new AuthenticationError('Invalid session')
  }

  const user = session.user
  const userResponse = {
    id: user.id,
    username: user.username,
    email: user.email,
    walletAddress: user.walletAddress,
    avatar: user.avatar,
    level: user.level,
    experience: user.experience,
    totalTrades: user.totalTrades,
    totalPnL: user.totalPnL,
    isVerified: user.isVerified,
    isAdmin: user.isAdmin,
    lastLoginAt: user.lastLoginAt,
    achievements: user.achievements.map(ua => ({
      id: ua.achievement.id,
      title: ua.achievement.title,
      description: ua.achievement.description,
      icon: ua.achievement.icon,
      rarity: ua.achievement.rarity,
      unlockedAt: ua.unlockedAt
    })),
    guild: user.guildMember ? {
      id: user.guildMember.guild.id,
      name: user.guildMember.guild.name,
      role: user.guildMember.role,
      contribution: user.guildMember.contribution
    } : null,
    portfolio: user.portfolio ? {
      totalValue: user.portfolio.totalValue,
      totalPnL: user.portfolio.totalPnL,
      totalPnLPercent: user.portfolio.totalPnLPercent
    } : null,
    createdAt: user.createdAt
  }

  res.json({
    success: true,
    user: userResponse
  })
}))

// Helper functions

async function verifyWalletSignature(
  walletAddress: string,
  signature: string,
  message: string,
  publicKey?: string
): Promise<boolean> {
  try {
    // Convert from base58
    const signatureBytes = bs58.decode(signature)
    const messageBytes = new TextEncoder().encode(message)

    // Use provided publicKey or derive from walletAddress
    const pubKey = publicKey ? bs58.decode(publicKey) : new PublicKey(walletAddress).toBytes()

    // Verify signature
    return nacl.sign.detached.verify(messageBytes, signatureBytes, pubKey)
  } catch (error) {
    logger.error('Signature verification failed', { error: error.message })
    return false
  }
}

async function generateUniqueUsername(walletAddress: string): Promise<string> {
  const baseUsername = `Roach${walletAddress.slice(-6)}`
  let username = baseUsername
  let counter = 1

  while (await prisma.user.findUnique({ where: { username } })) {
    username = `${baseUsername}${counter}`
    counter++
  }

  return username
}

async function awardNewUserAchievements(userId: string): Promise<void> {
  try {
    // Get welcome achievements
    const welcomeAchievements = await prisma.achievement.findMany({
      where: {
        type: 'SPECIAL',
        title: {
          in: ['Welcome to the Roach Army', 'First Steps', 'Nuclear Newcomer']
        }
      }
    })

    // Award achievements
    for (const achievement of welcomeAchievements) {
      await prisma.userAchievement.create({
        data: {
          userId,
          achievementId: achievement.id,
          isUnlocked: true,
          unlockedAt: new Date(),
          progress: 1,
          maxProgress: 1
        }
      })
    }

    // Add initial XP
    await prisma.user.update({
      where: { id: userId },
      data: { experience: 100 }
    })

  } catch (error) {
    logger.error('Failed to award new user achievements', { userId, error: error.message })
  }
}

export default router
