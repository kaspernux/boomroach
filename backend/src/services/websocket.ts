import { Server as SocketIOServer, Socket } from 'socket.io'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import { logger } from '../utils/logger'

interface AuthenticatedSocket extends Socket {
  userId?: string
  username?: string
  rooms?: Set<string>
}

interface PriceUpdate {
  symbol: string
  price: number
  change24h: number
  volume24h: number
  timestamp: Date
}

interface TradingSignal {
  id: string
  symbol: string
  action: 'BUY' | 'SELL' | 'HOLD'
  confidence: number
  price: number
  reasoning: string
  timestamp: Date
}

interface ChatMessage {
  id: string
  userId: string
  username: string
  content: string
  type: 'text' | 'trade_signal' | 'achievement' | 'system'
  channelId?: string
  timestamp: Date
}

interface CommunityUpdate {
  type: 'user_joined' | 'user_left' | 'new_achievement' | 'trade_completed' | 'quest_completed'
  userId: string
  username: string
  data?: any
  timestamp: Date
}

export class WebSocketService {
  private io: SocketIOServer
  private prisma: PrismaClient
  private connectedUsers: Map<string, AuthenticatedSocket>
  private userRooms: Map<string, Set<string>>
  private priceSubscriptions: Map<string, Set<string>> // symbol -> userIds
  private heartbeatInterval: NodeJS.Timeout

  constructor(io: SocketIOServer) {
    this.io = io
    this.prisma = new PrismaClient()
    this.connectedUsers = new Map()
    this.userRooms = new Map()
    this.priceSubscriptions = new Map()

    // Start heartbeat to clean up stale connections
    this.heartbeatInterval = setInterval(() => {
      this.cleanupStaleConnections()
    }, 30000) // 30 seconds
  }

  async handleConnection(socket: AuthenticatedSocket) {
    try {
      // Authenticate user
      const token = socket.handshake.auth.token
      if (!token) {
        socket.emit('error', { message: 'Authentication required' })
        socket.disconnect(true)
        return
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
      const userId = decoded.userId

      // Get user details
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          level: true,
          isAdmin: true,
          isBanned: true,
          guildMember: {
            include: {
              guild: true
            }
          }
        }
      })

      if (!user || user.isBanned) {
        socket.emit('error', { message: 'Account not found or banned' })
        socket.disconnect(true)
        return
      }

      // Set socket properties
      socket.userId = user.id
      socket.username = user.username
      socket.rooms = new Set()

      // Store connection
      this.connectedUsers.set(socket.id, socket)

      // Join user to personal room
      socket.join(`user:${user.id}`)

      // Join guild room if member
      if (user.guildMember) {
        const guildRoom = `guild:${user.guildMember.guild.id}`
        socket.join(guildRoom)
        socket.rooms.add(guildRoom)
      }

      // Join global community room
      socket.join('community')
      socket.rooms.add('community')

      // Send welcome message
      socket.emit('authenticated', {
        userId: user.id,
        username: user.username,
        level: user.level,
        connectedUsers: this.getConnectedUsersCount()
      })

      // Broadcast user joined to community
      this.broadcastCommunityUpdate({
        type: 'user_joined',
        userId: user.id,
        username: user.username,
        timestamp: new Date()
      })

      // Set up event handlers
      this.setupEventHandlers(socket)

      logger.info('User connected via WebSocket', {
        userId: user.id,
        username: user.username,
        socketId: socket.id
      })

    } catch (error) {
      logger.error('WebSocket authentication failed', { error: error.message })
      socket.emit('error', { message: 'Authentication failed' })
      socket.disconnect(true)
    }
  }

  handleDisconnection(socket: AuthenticatedSocket) {
    if (socket.userId) {
      // Broadcast user left
      this.broadcastCommunityUpdate({
        type: 'user_left',
        userId: socket.userId,
        username: socket.username || 'Unknown',
        timestamp: new Date()
      })

      // Clean up price subscriptions
      this.cleanupUserSubscriptions(socket.userId)

      logger.info('User disconnected from WebSocket', {
        userId: socket.userId,
        username: socket.username,
        socketId: socket.id
      })
    }

    // Remove from connected users
    this.connectedUsers.delete(socket.id)
  }

  private setupEventHandlers(socket: AuthenticatedSocket) {
    // Price subscription management
    socket.on('subscribe_prices', (symbols: string[]) => {
      this.handlePriceSubscription(socket, symbols)
    })

    socket.on('unsubscribe_prices', (symbols: string[]) => {
      this.handlePriceUnsubscription(socket, symbols)
    })

    // Chat messages
    socket.on('send_message', async (data: { content: string, channelId?: string }) => {
      await this.handleChatMessage(socket, data)
    })

    // Trading signals
    socket.on('request_trading_signals', (symbol: string) => {
      this.handleTradingSignalRequest(socket, symbol)
    })

    socket.on('request_signal', (data: { token: string }) => {
      this.handleSignalRequest(socket, data.token)
    })

    // Bot configuration updates
    socket.on('config_update', (config: any) => {
      this.handleConfigUpdate(socket, config)
    })

    // Alert acknowledgment
    socket.on('acknowledge_alert', (alertId: string) => {
      this.handleAlertAcknowledgment(socket, alertId)
    })

    // Guild operations
    socket.on('join_guild', async (guildId: string) => {
      await this.handleGuildJoin(socket, guildId)
    })

    socket.on('leave_guild', async () => {
      await this.handleGuildLeave(socket)
    })

    // Achievement notifications
    socket.on('achievement_unlocked', (achievementId: string) => {
      this.handleAchievementUnlocked(socket, achievementId)
    })

    // Quest updates
    socket.on('quest_progress', (questId: string, progress: number) => {
      this.handleQuestProgress(socket, questId, progress)
    })

    // Heartbeat
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: Date.now() })
    })
  }

  // Price subscription handlers
  private handlePriceSubscription(socket: AuthenticatedSocket, symbols: string[]) {
    if (!socket.userId) return

    for (const symbol of symbols) {
      if (!this.priceSubscriptions.has(symbol)) {
        this.priceSubscriptions.set(symbol, new Set())
      }
      this.priceSubscriptions.get(symbol)!.add(socket.userId)
    }

    socket.emit('price_subscription_confirmed', { symbols })
  }

  private handlePriceUnsubscription(socket: AuthenticatedSocket, symbols: string[]) {
    if (!socket.userId) return

    for (const symbol of symbols) {
      const subscribers = this.priceSubscriptions.get(symbol)
      if (subscribers) {
        subscribers.delete(socket.userId)
        if (subscribers.size === 0) {
          this.priceSubscriptions.delete(symbol)
        }
      }
    }
  }

  // Chat message handler
  private async handleChatMessage(socket: AuthenticatedSocket, data: { content: string, channelId?: string }) {
    if (!socket.userId || !socket.username) return

    try {
      // Validate message
      if (!data.content || data.content.trim().length === 0) return
      if (data.content.length > 500) return // Max message length

      // Create message
      const message: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: socket.userId,
        username: socket.username,
        content: data.content.trim(),
        type: 'text',
        channelId: data.channelId,
        timestamp: new Date()
      }

      // Store in database if it's a guild channel
      if (data.channelId) {
        await this.prisma.message.create({
          data: {
            senderId: socket.userId,
            channelId: data.channelId,
            content: message.content,
            type: 'TEXT'
          }
        })
      }

      // Broadcast to appropriate room
      const room = data.channelId ? `channel:${data.channelId}` : 'community'
      this.io.to(room).emit('new_message', message)

      logger.info('Chat message sent', {
        userId: socket.userId,
        username: socket.username,
        room,
        messageLength: data.content.length
      })

    } catch (error) {
      logger.error('Failed to handle chat message', { error: error.message })
      socket.emit('error', { message: 'Failed to send message' })
    }
  }

  // Trading signal handler
  private handleTradingSignalRequest(socket: AuthenticatedSocket, symbol: string) {
    // Generate mock trading signal
    const signal: TradingSignal = {
      id: `signal_${Date.now()}`,
      symbol,
      action: Math.random() > 0.5 ? 'BUY' : 'SELL',
      confidence: Math.floor(Math.random() * 30) + 70, // 70-100%
      price: Math.random() * 1000,
      reasoning: 'AI analysis suggests strong momentum based on volume and price action',
      timestamp: new Date()
    }

    socket.emit('trading_signal', signal)
  }

  // Guild handlers
  private async handleGuildJoin(socket: AuthenticatedSocket, guildId: string) {
    if (!socket.userId) return

    try {
      // Check if user is member of the guild
      const membership = await this.prisma.guildMember.findFirst({
        where: {
          userId: socket.userId,
          guildId
        },
        include: {
          guild: true
        }
      })

      if (membership) {
        const guildRoom = `guild:${guildId}`
        socket.join(guildRoom)
        socket.rooms?.add(guildRoom)

        socket.emit('guild_joined', {
          guildId,
          guildName: membership.guild.name,
          role: membership.role
        })
      }
    } catch (error) {
      logger.error('Failed to join guild room', { error: error.message })
    }
  }

  private async handleGuildLeave(socket: AuthenticatedSocket) {
    if (!socket.userId) return

    // Remove from all guild rooms
    for (const room of socket.rooms || []) {
      if (room.startsWith('guild:')) {
        socket.leave(room)
        socket.rooms?.delete(room)
      }
    }

    socket.emit('guild_left')
  }

  // Achievement handler
  private async handleAchievementUnlocked(socket: AuthenticatedSocket, achievementId: string) {
    if (!socket.userId || !socket.username) return

    try {
      const achievement = await this.prisma.achievement.findUnique({
        where: { id: achievementId }
      })

      if (achievement) {
        // Broadcast to community
        this.broadcastCommunityUpdate({
          type: 'new_achievement',
          userId: socket.userId,
          username: socket.username,
          data: {
            achievementTitle: achievement.title,
            achievementIcon: achievement.icon,
            rarity: achievement.rarity
          },
          timestamp: new Date()
        })
      }
    } catch (error) {
      logger.error('Failed to handle achievement unlock', { error: error.message })
    }
  }

  // Quest progress handler
  private handleQuestProgress(socket: AuthenticatedSocket, questId: string, progress: number) {
    if (!socket.userId) return

    // Emit quest progress update to user
    socket.emit('quest_progress_updated', {
      questId,
      progress,
      timestamp: new Date()
    })
  }

  // Hydra Bot signal request handler
  private async handleSignalRequest(socket: AuthenticatedSocket, token: string) {
    if (!socket.userId) return

    try {
      // Generate AI trading signal (would integrate with real AI service)
      const signal = await this.generateTradingSignal(token)

      socket.emit('trading_signal', signal)

      logger.info('Trading signal requested', {
        userId: socket.userId,
        token,
        signalId: signal.id
      })
    } catch (error) {
      logger.error('Failed to generate trading signal', {
        token,
        error: error.message
      })
      socket.emit('error', { message: 'Failed to generate signal' })
    }
  }

  // Bot configuration update handler
  private handleConfigUpdate(socket: AuthenticatedSocket, config: any) {
    if (!socket.userId) return

    // Broadcast config update confirmation
    socket.emit('config_updated', {
      config,
      timestamp: new Date()
    })

    logger.info('Bot configuration updated', {
      userId: socket.userId,
      config
    })
  }

  // Alert acknowledgment handler
  private handleAlertAcknowledgment(socket: AuthenticatedSocket, alertId: string) {
    if (!socket.userId) return

    // Mark alert as acknowledged
    socket.emit('alert_acknowledged', {
      alertId,
      timestamp: new Date()
    })

    logger.info('Risk alert acknowledged', {
      userId: socket.userId,
      alertId
    })
  }

  // Generate AI trading signal
  private async generateTradingSignal(token: string): Promise<TradingSignal> {
    // Mock AI signal generation - would integrate with OpenAI/ML models
    const actions: ('BUY' | 'SELL' | 'HOLD')[] = ['BUY', 'SELL', 'HOLD']
    const action = actions[Math.floor(Math.random() * actions.length)]
    const confidence = Math.floor(Math.random() * 40) + 60 // 60-100%
    const price = Math.random() * 1000

    return {
      id: `signal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      token,
      action,
      confidence,
      price,
      reasoning: this.generateSignalReasoning(action, confidence),
      timestamp: new Date(),
      aiScore: confidence,
      riskLevel: confidence > 85 ? 'LOW' : confidence > 70 ? 'MEDIUM' : 'HIGH',
      expectedProfit: Math.random() * 30 + 5, // 5-35%
      liquidityScore: Math.floor(Math.random() * 100)
    }
  }

  // Generate signal reasoning
  private generateSignalReasoning(action: string, confidence: number): string {
    const reasons = {
      BUY: [
        'Strong upward momentum detected with increasing volume',
        'AI pattern recognition indicates bullish breakout',
        'Social sentiment analysis shows positive community engagement',
        'Technical indicators suggest oversold bounce opportunity'
      ],
      SELL: [
        'Resistance level reached with declining volume momentum',
        'AI detects potential reversal pattern formation',
        'Risk management protocols suggest profit realization',
        'Technical analysis shows overbought market conditions'
      ],
      HOLD: [
        'Market consolidation phase with unclear direction',
        'Mixed technical signals require additional confirmation',
        'Current price within established fair value range',
        'Waiting for stronger directional momentum signals'
      ]
    }

    const actionReasons = reasons[action as keyof typeof reasons]
    return actionReasons[Math.floor(Math.random() * actionReasons.length)]
  }

  // Public methods for external services

  public broadcastPriceUpdate(priceUpdate: PriceUpdate) {
    const subscribers = this.priceSubscriptions.get(priceUpdate.symbol)
    if (subscribers && subscribers.size > 0) {
      // Broadcast to all subscribers of this symbol
      for (const [socketId, socket] of this.connectedUsers) {
        if (socket.userId && subscribers.has(socket.userId)) {
          socket.emit('price_update', priceUpdate)
        }
      }
    }
  }

  public broadcastTradingSignal(signal: TradingSignal) {
    this.io.to('community').emit('trading_signal', signal)
  }

  public broadcastCommunityUpdate(update: CommunityUpdate) {
    this.io.to('community').emit('community_update', update)
  }

  public sendNotificationToUser(userId: string, notification: any) {
    this.io.to(`user:${userId}`).emit('notification', notification)
  }

  public sendGuildNotification(guildId: string, notification: any) {
    this.io.to(`guild:${guildId}`).emit('guild_notification', notification)
  }

  public broadcastTradeExecution(userId: string, trade: any) {
    this.io.to(`user:${userId}`).emit('trade_executed', trade)
  }

  public sendRiskAlert(userId: string, alert: any) {
    this.io.to(`user:${userId}`).emit('risk_alert', alert)
  }

  public broadcastPortfolioUpdate(userId: string, portfolio: any) {
    this.io.to(`user:${userId}`).emit('portfolio_update', portfolio)
  }

  public sendBotStats(userId: string, stats: any) {
    this.io.to(`user:${userId}`).emit('bot_stats', stats)
  }

  // Utility methods

  private cleanupUserSubscriptions(userId: string) {
    for (const [symbol, subscribers] of this.priceSubscriptions) {
      subscribers.delete(userId)
      if (subscribers.size === 0) {
        this.priceSubscriptions.delete(symbol)
      }
    }
  }

  private cleanupStaleConnections() {
    const now = Date.now()
    for (const [socketId, socket] of this.connectedUsers) {
      // Check if socket is still connected
      if (!socket.connected) {
        this.connectedUsers.delete(socketId)
        if (socket.userId) {
          this.cleanupUserSubscriptions(socket.userId)
        }
      }
    }
  }

  private getConnectedUsersCount(): number {
    return this.connectedUsers.size
  }

  public getActiveConnections(): number {
    return this.connectedUsers.size
  }

  public getSubscriptionStats(): { [symbol: string]: number } {
    const stats: { [symbol: string]: number } = {}
    for (const [symbol, subscribers] of this.priceSubscriptions) {
      stats[symbol] = subscribers.size
    }
    return stats
  }

  public async shutdown() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
    }
    await this.prisma.$disconnect()
  }
}
