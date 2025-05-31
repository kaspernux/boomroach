import { Router, type Request, type Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '@/config/database';
import { 
  generateToken, 
  generateRefreshToken, 
  verifyRefreshToken,
  authenticate,
  strictRateLimit 
} from '@/middleware/auth';
import { validateWalletSignature, handleValidationErrors } from '@/middleware/validation';
import { WalletService } from '@/services/solana';
import { logger } from '@/utils/logger';
import { env } from '@/config/environment';

const router = Router();

/**
 * @swagger
 * /auth/wallet-login:
 *   post:
 *     summary: Login or register with Solana wallet
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
 *                 description: Solana wallet address
 *               signature:
 *                 type: string
 *                 description: Signed message signature
 *               message:
 *                 type: string
 *                 description: Original message that was signed
 *               username:
 *                 type: string
 *                 description: Optional username for new users
 *               email:
 *                 type: string
 *                 description: Optional email for new users
 *     responses:
 *       200:
 *         description: Successfully authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                 tokens:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *                     expiresIn:
 *                       type: string
 */
router.post('/wallet-login', strictRateLimit, validateWalletSignature, async (req: Request, res: Response) => {
  try {
    const { walletAddress, signature, message, username, email } = req.body;

    // Validate wallet address format
    if (!WalletService.validateAddress(walletAddress)) {
      res.status(400).json({
        error: 'Invalid wallet address',
        message: 'The provided wallet address is not valid',
      });
      return;
    }

    // TODO: In production, verify the signature against the message and wallet address
    // For now, we'll skip signature verification for development purposes
    const isValidSignature = true; // await verifyWalletSignature(walletAddress, message, signature);

    if (!isValidSignature) {
      res.status(401).json({
        error: 'Invalid signature',
        message: 'Wallet signature verification failed',
      });
      return;
    }

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { walletAddress },
      select: {
        id: true,
        walletAddress: true,
        username: true,
        displayName: true,
        email: true,
        avatar: true,
        level: true,
        experience: true,
        totalTrades: true,
        totalVolume: true,
        isVerified: true,
        isAdmin: true,
        isBanned: true,
        createdAt: true,
        lastActive: true,
      },
    });

    if (user && user.isBanned) {
      res.status(403).json({
        error: 'Account banned',
        message: 'Your account has been banned',
      });
      return;
    }

    let isNewUser = false;

    // Create new user if doesn't exist
    if (!user) {
      try {
        user = await prisma.user.create({
          data: {
            walletAddress,
            username: username || null,
            email: email || null,
            lastActive: new Date(),
          },
          select: {
            id: true,
            walletAddress: true,
            username: true,
            displayName: true,
            email: true,
            avatar: true,
            level: true,
            experience: true,
            totalTrades: true,
            totalVolume: true,
            isVerified: true,
            isAdmin: true,
            isBanned: true,
            createdAt: true,
            lastActive: true,
          },
        });

        // Create initial portfolio
        await prisma.portfolio.create({
          data: {
            userId: user.id,
          },
        });

        isNewUser = true;
        logger.info(`New user registered: ${user.id} (${walletAddress})`);
      } catch (error: any) {
        if (error.code === 'P2002') {
          // Unique constraint violation
          res.status(400).json({
            error: 'Registration failed',
            message: 'Username or email already exists',
          });
          return;
        }
        throw error;
      }
    } else {
      // Update last active for existing user
      await prisma.user.update({
        where: { id: user.id },
        data: { lastActive: new Date() },
      });
    }

    // Generate tokens
    const accessToken = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store session in database
    await prisma.userSession.create({
      data: {
        userId: user.id,
        token: accessToken,
        refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || null,
      },
    });

    // Remove sensitive information
    const userResponse = {
      ...user,
      walletBalance: isNewUser ? 0 : await WalletService.getBalance(walletAddress),
    };

    res.json({
      success: true,
      message: isNewUser ? 'Account created successfully' : 'Login successful',
      user: userResponse,
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: '7d',
      },
      isNewUser,
    });

    logger.info(`User ${isNewUser ? 'registered' : 'logged in'}: ${user.id}`);
  } catch (error) {
    logger.error('Wallet login error:', error);
    res.status(500).json({
      error: 'Authentication failed',
      message: 'Internal server error during authentication',
    });
  }
});

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 */
router.post('/refresh', strictRateLimit, async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        error: 'Refresh token required',
        message: 'Refresh token is required',
      });
      return;
    }

    // Verify refresh token
    const decoded = await verifyRefreshToken(refreshToken);
    if (!decoded) {
      res.status(401).json({
        error: 'Invalid refresh token',
        message: 'Refresh token is invalid or expired',
      });
      return;
    }

    // Check if session exists and is valid
    const session = await prisma.userSession.findUnique({
      where: { refreshToken },
      include: {
        user: {
          select: {
            id: true,
            walletAddress: true,
            isAdmin: true,
            isBanned: true,
          },
        },
      },
    });

    if (!session || session.expiresAt < new Date()) {
      res.status(401).json({
        error: 'Session expired',
        message: 'Session has expired, please login again',
      });
      return;
    }

    if (session.user.isBanned) {
      res.status(403).json({
        error: 'Account banned',
        message: 'Your account has been banned',
      });
      return;
    }

    // Generate new tokens
    const newAccessToken = generateToken(session.user);
    const newRefreshToken = generateRefreshToken(session.user);

    // Update session with new tokens
    await prisma.userSession.update({
      where: { id: session.id },
      data: {
        token: newAccessToken,
        refreshToken: newRefreshToken,
        lastUsed: new Date(),
      },
    });

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      tokens: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: '7d',
      },
    });

    logger.debug(`Token refreshed for user: ${session.user.id}`);
  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(500).json({
      error: 'Token refresh failed',
      message: 'Internal server error during token refresh',
    });
  }
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user and invalidate session
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', authenticate, async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.substring(7);
    
    if (token) {
      // Delete the session from database
      await prisma.userSession.deleteMany({
        where: {
          userId: req.user!.id,
          token,
        },
      });
    }

    res.json({
      success: true,
      message: 'Logged out successfully',
    });

    logger.info(`User logged out: ${req.user!.id}`);
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      error: 'Logout failed',
      message: 'Internal server error during logout',
    });
  }
});

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 */
router.get('/profile', authenticate, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        walletAddress: true,
        username: true,
        displayName: true,
        email: true,
        avatar: true,
        bio: true,
        level: true,
        experience: true,
        totalTrades: true,
        totalVolume: true,
        isVerified: true,
        isAdmin: true,
        createdAt: true,
        lastActive: true,
        portfolio: {
          select: {
            totalValue: true,
            totalPnl: true,
            totalPnlPct: true,
            updatedAt: true,
          },
        },
        achievements: {
          include: {
            achievement: true,
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({
        error: 'User not found',
        message: 'User profile not found',
      });
      return;
    }

    // Get wallet balance
    const walletBalance = await WalletService.getBalance(user.walletAddress);

    res.json({
      success: true,
      user: {
        ...user,
        walletBalance,
        achievementsCount: user.achievements.length,
      },
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      error: 'Failed to get profile',
      message: 'Internal server error',
    });
  }
});

/**
 * @swagger
 * /auth/sessions:
 *   get:
 *     summary: Get user's active sessions
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active sessions retrieved successfully
 */
router.get('/sessions', authenticate, async (req: Request, res: Response) => {
  try {
    const sessions = await prisma.userSession.findMany({
      where: {
        userId: req.user!.id,
        expiresAt: {
          gt: new Date(),
        },
      },
      select: {
        id: true,
        createdAt: true,
        lastUsed: true,
        ipAddress: true,
        userAgent: true,
        expiresAt: true,
      },
      orderBy: {
        lastUsed: 'desc',
      },
    });

    res.json({
      success: true,
      sessions,
    });
  } catch (error) {
    logger.error('Get sessions error:', error);
    res.status(500).json({
      error: 'Failed to get sessions',
      message: 'Internal server error',
    });
  }
});

/**
 * @swagger
 * /auth/sessions/{sessionId}:
 *   delete:
 *     summary: Revoke a specific session
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session revoked successfully
 */
router.delete('/sessions/:sessionId', authenticate, async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    const deletedSession = await prisma.userSession.deleteMany({
      where: {
        id: sessionId,
        userId: req.user!.id,
      },
    });

    if (deletedSession.count === 0) {
      res.status(404).json({
        error: 'Session not found',
        message: 'Session not found or already revoked',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Session revoked successfully',
    });

    logger.info(`Session revoked: ${sessionId} by user ${req.user!.id}`);
  } catch (error) {
    logger.error('Revoke session error:', error);
    res.status(500).json({
      error: 'Failed to revoke session',
      message: 'Internal server error',
    });
  }
});

export default router;