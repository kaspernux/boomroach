import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import { logger } from '../utils/logger'
import { ApiError } from '../utils/errors'

const prisma = new PrismaClient()

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    username: string
    walletAddress: string
    level: number
    isAdmin: boolean
    isVerified: boolean
  }
  session?: {
    id: string
    token: string
  }
}

/**
 * JWT Authentication middleware
 * Verifies the JWT token and adds user information to the request
 */
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

    if (!token) {
      throw new ApiError(401, 'Access token required')
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any

    // Check if session exists and is valid
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
            isBanned: true,
            lastLoginAt: true
          }
        }
      }
    })

    if (!session) {
      throw new ApiError(401, 'Invalid session')
    }

    if (session.expiresAt < new Date()) {
      // Session expired, remove it
      await prisma.session.delete({ where: { id: session.id } })
      throw new ApiError(401, 'Session expired')
    }

    if (session.user.isBanned) {
      throw new ApiError(403, 'Account is banned')
    }

    // Add user and session to request
    req.user = session.user
    req.session = {
      id: session.id,
      token: session.token
    }

    // Update last activity
    await prisma.user.update({
      where: { id: session.user.id },
      data: { lastLoginAt: new Date() }
    })

    next()
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({ error: error.message })
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token expired' })
    }

    logger.error('Authentication error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

/**
 * Admin-only middleware
 * Requires user to be authenticated and have admin privileges
 */
export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin privileges required' })
  }

  next()
}

/**
 * Verified user middleware
 * Requires user to be verified
 */
export const requireVerified = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  if (!req.user.isVerified) {
    return res.status(403).json({ error: 'Account verification required' })
  }

  next()
}

/**
 * Level requirement middleware factory
 * Requires user to have a minimum level
 */
export const requireLevel = (minLevel: number) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    if (req.user.level < minLevel) {
      return res.status(403).json({
        error: `Level ${minLevel} required`,
        currentLevel: req.user.level,
        requiredLevel: minLevel
      })
    }

    next()
  }
}

/**
 * Rate limiting per user
 */
export const createUserRateLimit = (maxRequests: number, windowMs: number) => {
  const userRequests = new Map<string, { count: number, resetTime: number }>()

  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next() // Let auth middleware handle this
    }

    const userId = req.user.id
    const now = Date.now()
    const userLimit = userRequests.get(userId)

    if (!userLimit || now > userLimit.resetTime) {
      // Reset or initialize limit
      userRequests.set(userId, {
        count: 1,
        resetTime: now + windowMs
      })
      return next()
    }

    if (userLimit.count >= maxRequests) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        resetTime: new Date(userLimit.resetTime).toISOString()
      })
    }

    userLimit.count++
    next()
  }
}

/**
 * Guild membership middleware
 * Requires user to be a member of a specific guild
 */
export const requireGuildMembership = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const guildId = req.params.guildId || req.body.guildId
    if (!guildId) {
      return res.status(400).json({ error: 'Guild ID required' })
    }

    const membership = await prisma.guildMember.findFirst({
      where: {
        userId: req.user.id,
        guildId: guildId
      },
      include: {
        guild: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!membership) {
      return res.status(403).json({ error: 'Guild membership required' })
    }

    // Add guild membership info to request
    req.guildMember = membership

    next()
  } catch (error) {
    logger.error('Guild membership check error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

/**
 * Guild role middleware factory
 * Requires user to have a specific guild role or higher
 */
export const requireGuildRole = (minRole: 'MEMBER' | 'OFFICER' | 'LEADER') => {
  const roleHierarchy = {
    MEMBER: 1,
    OFFICER: 2,
    LEADER: 3
  }

  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' })
      }

      const guildId = req.params.guildId || req.body.guildId
      if (!guildId) {
        return res.status(400).json({ error: 'Guild ID required' })
      }

      const membership = await prisma.guildMember.findFirst({
        where: {
          userId: req.user.id,
          guildId: guildId
        }
      })

      if (!membership) {
        return res.status(403).json({ error: 'Guild membership required' })
      }

      const userRoleLevel = roleHierarchy[membership.role]
      const requiredRoleLevel = roleHierarchy[minRole]

      if (userRoleLevel < requiredRoleLevel) {
        return res.status(403).json({
          error: `Guild ${minRole.toLowerCase()} role required`,
          currentRole: membership.role,
          requiredRole: minRole
        })
      }

      req.guildMember = membership
      next()
    } catch (error) {
      logger.error('Guild role check error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }
}

// Extend Request interface
declare global {
  namespace Express {
    interface Request {
      guildMember?: any
    }
  }
}
