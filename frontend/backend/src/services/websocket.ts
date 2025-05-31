import { Server, type Socket } from 'socket.io';
import type { Server as HttpServer } from 'http';
import { verifyToken } from '@/middleware/auth';
import { prisma } from '@/config/database';
import { solanaService, PriceData } from '@/services/solana';
import { logger } from '@/utils/logger';
import { WS_CONFIG, CORS_ORIGINS } from '@/config/environment';

// WebSocket event types
export enum WSEvents {
  // Connection events
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  AUTHENTICATE = 'authenticate',
  AUTHENTICATED = 'authenticated',
  
  // Price feed events
  SUBSCRIBE_PRICES = 'subscribe_prices',
  UNSUBSCRIBE_PRICES = 'unsubscribe_prices',
  PRICE_UPDATE = 'price_update',
  
  // Chat events
  JOIN_GUILD = 'join_guild',
  LEAVE_GUILD = 'leave_guild',
  SEND_MESSAGE = 'send_message',
  NEW_MESSAGE = 'new_message',
  
  // Trading events
  TRADE_EXECUTED = 'trade_executed',
  PORTFOLIO_UPDATE = 'portfolio_update',
  
  // Notification events
  NOTIFICATION = 'notification',
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
  
  // System events
  USER_ONLINE = 'user_online',
  USER_OFFLINE = 'user_offline',
  HEARTBEAT = 'heartbeat',
}

// User session interface
interface UserSession {
  userId: string;
  socketId: string;
  walletAddress: string;
  isAdmin: boolean;
  subscribedTokens: Set<string>;
  joinedGuilds: Set<string>;
  lastActivity: Date;
}

// WebSocket service class
export class WebSocketService {
  private io: Server;
  private userSessions = new Map<string, UserSession>();
  private socketToUser = new Map<string, string>();
  private priceSubscriptions = new Map<string, Set<string>>(); // tokenMint -> socketIds
  private guildSubscriptions = new Map<string, Set<string>>(); // guildId -> socketIds
  private priceUpdateInterval: NodeJS.Timeout | null = null;

  constructor(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: CORS_ORIGINS,
        methods: ['GET', 'POST'],
        credentials: true,
      },
      pingInterval: WS_CONFIG.pingInterval,
      pingTimeout: WS_CONFIG.pingTimeout,
      transports: ['websocket', 'polling'],
    });

    this.setupEventHandlers();
    this.startPriceUpdates();
    this.setupHeartbeat();
  }

  private setupEventHandlers(): void {
    this.io.on(WSEvents.CONNECT, (socket: Socket) => {
      logger.debug(`WebSocket connection established: ${socket.id}`);

      // Authentication handler
      socket.on(WSEvents.AUTHENTICATE, async (data: { token: string }) => {
        await this.handleAuthentication(socket, data.token);
      });

      // Price subscription handlers
      socket.on(WSEvents.SUBSCRIBE_PRICES, (data: { tokens: string[] }) => {
        this.handlePriceSubscription(socket, data.tokens);
      });

      socket.on(WSEvents.UNSUBSCRIBE_PRICES, (data: { tokens: string[] }) => {
        this.handlePriceUnsubscription(socket, data.tokens);
      });

      // Chat handlers
      socket.on(WSEvents.JOIN_GUILD, (data: { guildId: string }) => {
        this.handleJoinGuild(socket, data.guildId);
      });

      socket.on(WSEvents.LEAVE_GUILD, (data: { guildId: string }) => {
        this.handleLeaveGuild(socket, data.guildId);
      });

      socket.on(WSEvents.SEND_MESSAGE, (data: { guildId: string; content: string; type?: string }) => {
        this.handleSendMessage(socket, data);
      });

      // Heartbeat handler
      socket.on(WSEvents.HEARTBEAT, () => {
        this.handleHeartbeat(socket);
      });

      // Disconnect handler
      socket.on(WSEvents.DISCONNECT, (reason: string) => {
        this.handleDisconnect(socket, reason);
      });

      // Send authentication requirement
      socket.emit(WSEvents.AUTHENTICATE, { required: true });
    });
  }

  private async handleAuthentication(socket: Socket, token: string): Promise<void> {
    try {
      const decoded = await verifyToken(token);
      if (!decoded) {
        socket.emit('error', { message: 'Invalid token' });
        socket.disconnect();
        return;
      }

      // Fetch user data
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          walletAddress: true,
          username: true,
          isAdmin: true,
          isBanned: true,
        },
      });

      if (!user || user.isBanned) {
        socket.emit('error', { message: 'User not found or banned' });
        socket.disconnect();
        return;
      }

      // Remove existing session if user is already connected
      const existingSession = Array.from(this.userSessions.values())
        .find(session => session.userId === user.id);
      
      if (existingSession) {
        const existingSocket = this.io.sockets.sockets.get(existingSession.socketId);
        if (existingSocket) {
          existingSocket.disconnect();
        }
        this.userSessions.delete(existingSession.socketId);
        this.socketToUser.delete(existingSession.socketId);
      }

      // Create new session
      const session: UserSession = {
        userId: user.id,
        socketId: socket.id,
        walletAddress: user.walletAddress,
        isAdmin: user.isAdmin,
        subscribedTokens: new Set(),
        joinedGuilds: new Set(),
        lastActivity: new Date(),
      };

      this.userSessions.set(socket.id, session);
      this.socketToUser.set(socket.id, user.id);

      // Update user's last active timestamp
      await prisma.user.update({
        where: { id: user.id },
        data: { lastActive: new Date() },
      });

      socket.emit(WSEvents.AUTHENTICATED, {
        userId: user.id,
        username: user.username,
        isAdmin: user.isAdmin,
      });

      // Notify other users that this user is online
      socket.broadcast.emit(WSEvents.USER_ONLINE, {
        userId: user.id,
        username: user.username,
      });

      logger.info(`User authenticated via WebSocket: ${user.id}`);
    } catch (error) {
      logger.error('WebSocket authentication error:', error);
      socket.emit('error', { message: 'Authentication failed' });
      socket.disconnect();
    }
  }

  private handlePriceSubscription(socket: Socket, tokens: string[]): void {
    const session = this.userSessions.get(socket.id);
    if (!session) return;

    for (const token of tokens) {
      // Add to user's subscriptions
      session.subscribedTokens.add(token);

      // Add to global price subscriptions
      if (!this.priceSubscriptions.has(token)) {
        this.priceSubscriptions.set(token, new Set());
      }
      this.priceSubscriptions.get(token)!.add(socket.id);
    }

    logger.debug(`User ${session.userId} subscribed to prices:`, tokens);
  }

  private handlePriceUnsubscription(socket: Socket, tokens: string[]): void {
    const session = this.userSessions.get(socket.id);
    if (!session) return;

    for (const token of tokens) {
      // Remove from user's subscriptions
      session.subscribedTokens.delete(token);

      // Remove from global price subscriptions
      const subscribers = this.priceSubscriptions.get(token);
      if (subscribers) {
        subscribers.delete(socket.id);
        if (subscribers.size === 0) {
          this.priceSubscriptions.delete(token);
        }
      }
    }

    logger.debug(`User ${session.userId} unsubscribed from prices:`, tokens);
  }

  private async handleJoinGuild(socket: Socket, guildId: string): Promise<void> {
    const session = this.userSessions.get(socket.id);
    if (!session) return;

    try {
      // Verify user is a member of the guild
      const membership = await prisma.guildMember.findUnique({
        where: {
          userId_guildId: {
            userId: session.userId,
            guildId: guildId,
          },
        },
      });

      if (!membership) {
        socket.emit('error', { message: 'Not a member of this guild' });
        return;
      }

      // Join socket room
      socket.join(`guild:${guildId}`);
      session.joinedGuilds.add(guildId);

      // Add to guild subscriptions
      if (!this.guildSubscriptions.has(guildId)) {
        this.guildSubscriptions.set(guildId, new Set());
      }
      this.guildSubscriptions.get(guildId)!.add(socket.id);

      socket.emit('guild_joined', { guildId });
      logger.debug(`User ${session.userId} joined guild ${guildId}`);
    } catch (error) {
      logger.error('Error joining guild:', error);
      socket.emit('error', { message: 'Failed to join guild' });
    }
  }

  private handleLeaveGuild(socket: Socket, guildId: string): void {
    const session = this.userSessions.get(socket.id);
    if (!session) return;

    socket.leave(`guild:${guildId}`);
    session.joinedGuilds.delete(guildId);

    const subscribers = this.guildSubscriptions.get(guildId);
    if (subscribers) {
      subscribers.delete(socket.id);
      if (subscribers.size === 0) {
        this.guildSubscriptions.delete(guildId);
      }
    }

    socket.emit('guild_left', { guildId });
    logger.debug(`User ${session.userId} left guild ${guildId}`);
  }

  private async handleSendMessage(socket: Socket, data: { guildId: string; content: string; type?: string }): Promise<void> {
    const session = this.userSessions.get(socket.id);
    if (!session) return;

    try {
      // Verify user is in the guild
      if (!session.joinedGuilds.has(data.guildId)) {
        socket.emit('error', { message: 'Not in this guild' });
        return;
      }

      // Create message in database
      const message = await prisma.message.create({
        data: {
          content: data.content,
          type: (data.type as any) || 'TEXT',
          userId: session.userId,
          guildId: data.guildId,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
              level: true,
            },
          },
        },
      });

      // Broadcast message to all guild members
      this.io.to(`guild:${data.guildId}`).emit(WSEvents.NEW_MESSAGE, {
        id: message.id,
        content: message.content,
        type: message.type,
        createdAt: message.createdAt,
        user: message.user,
        guildId: data.guildId,
      });

      logger.debug(`Message sent in guild ${data.guildId} by user ${session.userId}`);
    } catch (error) {
      logger.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  }

  private handleHeartbeat(socket: Socket): void {
    const session = this.userSessions.get(socket.id);
    if (session) {
      session.lastActivity = new Date();
      socket.emit(WSEvents.HEARTBEAT, { timestamp: Date.now() });
    }
  }

  private handleDisconnect(socket: Socket, reason: string): void {
    const session = this.userSessions.get(socket.id);
    if (session) {
      // Clean up subscriptions
      for (const token of session.subscribedTokens) {
        const subscribers = this.priceSubscriptions.get(token);
        if (subscribers) {
          subscribers.delete(socket.id);
          if (subscribers.size === 0) {
            this.priceSubscriptions.delete(token);
          }
        }
      }

      for (const guildId of session.joinedGuilds) {
        const subscribers = this.guildSubscriptions.get(guildId);
        if (subscribers) {
          subscribers.delete(socket.id);
          if (subscribers.size === 0) {
            this.guildSubscriptions.delete(guildId);
          }
        }
      }

      // Notify other users that this user is offline
      socket.broadcast.emit(WSEvents.USER_OFFLINE, {
        userId: session.userId,
      });

      this.userSessions.delete(socket.id);
      this.socketToUser.delete(socket.id);

      logger.info(`User ${session.userId} disconnected: ${reason}`);
    }

    logger.debug(`WebSocket disconnected: ${socket.id} (${reason})`);
  }

  private async startPriceUpdates(): Promise<void> {
    this.priceUpdateInterval = setInterval(async () => {
      if (this.priceSubscriptions.size === 0) return;

      try {
        const subscribedTokens = Array.from(this.priceSubscriptions.keys());
        const prices = await solanaService.getPrices(subscribedTokens);

        for (const priceData of prices) {
          const subscribers = this.priceSubscriptions.get(priceData.mint);
          if (subscribers && subscribers.size > 0) {
            for (const socketId of subscribers) {
              const socket = this.io.sockets.sockets.get(socketId);
              if (socket) {
                socket.emit(WSEvents.PRICE_UPDATE, priceData);
              }
            }
          }
        }
      } catch (error) {
        logger.error('Error updating prices via WebSocket:', error);
      }
    }, 5000); // Update every 5 seconds
  }

  private setupHeartbeat(): void {
    setInterval(() => {
      const now = new Date();
      const staleThreshold = 60000; // 1 minute

      for (const [socketId, session] of this.userSessions) {
        if (now.getTime() - session.lastActivity.getTime() > staleThreshold) {
          const socket = this.io.sockets.sockets.get(socketId);
          if (socket) {
            socket.disconnect();
          }
        }
      }
    }, 30000); // Check every 30 seconds
  }

  // Public methods for external use
  public async sendNotification(userId: string, notification: any): Promise<void> {
    const sessions = Array.from(this.userSessions.values())
      .filter(session => session.userId === userId);

    for (const session of sessions) {
      const socket = this.io.sockets.sockets.get(session.socketId);
      if (socket) {
        socket.emit(WSEvents.NOTIFICATION, notification);
      }
    }
  }

  public async broadcastTradeExecuted(trade: any): Promise<void> {
    this.io.emit(WSEvents.TRADE_EXECUTED, trade);
  }

  public async sendAchievementUnlocked(userId: string, achievement: any): Promise<void> {
    const sessions = Array.from(this.userSessions.values())
      .filter(session => session.userId === userId);

    for (const session of sessions) {
      const socket = this.io.sockets.sockets.get(session.socketId);
      if (socket) {
        socket.emit(WSEvents.ACHIEVEMENT_UNLOCKED, achievement);
      }
    }
  }

  public getConnectedUsers(): string[] {
    return Array.from(this.userSessions.values()).map(session => session.userId);
  }

  public getConnectionCount(): number {
    return this.userSessions.size;
  }

  public cleanup(): void {
    if (this.priceUpdateInterval) {
      clearInterval(this.priceUpdateInterval);
    }
    this.io.close();
  }
}

let wsService: WebSocketService | null = null;

export const initializeWebSocket = (httpServer: HttpServer): WebSocketService => {
  wsService = new WebSocketService(httpServer);
  return wsService;
};

export const getWebSocketService = (): WebSocketService => {
  if (!wsService) {
    throw new Error('WebSocket service not initialized');
  }
  return wsService;
};

export default WebSocketService;