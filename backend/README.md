# BoomRoach 2025 Backend API

Advanced trading platform backend with gamification features, real-time data, and Solana blockchain integration.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Redis (optional, for caching)
- Docker & Docker Compose (recommended)

### Development Setup

1. **Clone and install dependencies:**
   ```bash
   cd backend
   bun install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start with Docker Compose (Recommended):**
   ```bash
   docker-compose up -d
   ```

4. **Or start manually:**
   ```bash
   # Start PostgreSQL and Redis separately
   bun run db:migrate
   bun run dev
   ```

### Database Setup

```bash
# Generate Prisma client
bun run db:generate

# Push schema to database
bun run db:push

# Run migrations
bun run db:migrate

# Seed initial data
bun run db:seed

# Open Prisma Studio
bun run db:studio
```

## 📚 API Documentation

Once running, visit:
- **API Docs**: http://localhost:3001/api-docs
- **Health Check**: http://localhost:3001/health
- **Database Admin**: http://localhost:8081 (Adminer)

## 🏗️ Architecture

### Tech Stack

- **Runtime**: Node.js 18+ with Bun
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with Solana wallet verification
- **Real-time**: Socket.IO WebSockets
- **Validation**: Zod schemas
- **Documentation**: Swagger/OpenAPI
- **Containerization**: Docker with multi-stage builds

### Project Structure

```
backend/
├── src/
│   ├── routes/          # API endpoints
│   ├── services/        # Business logic
│   ├── middleware/      # Express middleware
│   ├── utils/          # Utilities and helpers
│   ├── types/          # TypeScript type definitions
│   └── server.ts       # Main application entry
├── prisma/
│   ├── schema.prisma   # Database schema
│   └── migrations/     # Database migrations
├── docker-compose.yml  # Local development stack
├── Dockerfile         # Production container
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/wallet` - Authenticate with Solana wallet
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - Logout and invalidate session
- `GET /api/auth/me` - Get current user profile

### Prices
- `GET /api/prices/current` - Get current prices for all tokens
- `GET /api/prices/{symbol}` - Get specific token price
- `GET /api/prices/{symbol}/history` - Get price history
- `GET /api/prices/market/summary` - Get market summary

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/achievements` - Get user achievements
- `GET /api/users/portfolio` - Get user portfolio

### Trading
- `POST /api/trading/signals` - Get AI trading signals
- `POST /api/trading/execute` - Execute trade
- `GET /api/trading/history` - Get trading history
- `GET /api/trading/analytics` - Get trading analytics

### Guilds
- `GET /api/guilds` - List guilds
- `POST /api/guilds` - Create guild
- `POST /api/guilds/{id}/join` - Join guild
- `GET /api/guilds/{id}/members` - Get guild members

### Quests
- `GET /api/quests` - Get available quests
- `POST /api/quests/{id}/start` - Start quest
- `POST /api/quests/{id}/complete` - Complete quest
- `GET /api/quests/progress` - Get quest progress

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `3001` |
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `REDIS_URL` | Redis connection string | Optional |
| `SOLANA_RPC_URL` | Solana RPC endpoint | `https://api.mainnet-beta.solana.com` |

### Features Flags

- `ENABLE_WEBSOCKET` - Enable WebSocket real-time features
- `ENABLE_PRICE_UPDATES` - Enable price feed updates
- `ENABLE_TRADING_SIGNALS` - Enable AI trading signals
- `ENABLE_GUILD_WARS` - Enable guild war features

## 🔒 Security

### Authentication Flow

1. **Wallet Connection**: User connects Solana wallet
2. **Message Signing**: Frontend generates challenge message
3. **Signature Verification**: Backend verifies signature with public key
4. **JWT Issuance**: Server issues JWT token for session
5. **Request Authentication**: JWT validates subsequent requests

### Security Features

- **Rate Limiting**: IP-based and user-based rate limits
- **Input Validation**: Zod schema validation on all inputs
- **Error Handling**: Sanitized error responses
- **CORS**: Configurable cross-origin policies
- **Helmet**: Security headers middleware
- **Audit Logging**: Comprehensive audit trail

## 📊 Real-time Features

### WebSocket Events

**Client → Server:**
- `subscribe_prices` - Subscribe to price updates
- `send_message` - Send chat message
- `join_guild` - Join guild room
- `request_trading_signals` - Request AI signals

**Server → Client:**
- `price_update` - Real-time price data
- `trading_signal` - AI trading signal
- `new_message` - Chat message
- `community_update` - Community events
- `notification` - User notifications

## 🎮 Gamification System

### Achievements
- **Wallet Connection**: First wallet connection
- **Trading Milestones**: Volume and profit targets
- **Social Engagement**: Community participation
- **Special Events**: Seasonal and limited-time

### Quests
- **Daily Quests**: Login streaks, trading targets
- **Weekly Challenges**: Community goals
- **Seasonal Events**: Halloween, Christmas themes
- **Guild Quests**: Collaborative objectives

### Levels & XP
- **Experience Points**: Earned through activities
- **Level Progression**: Unlock features and perks
- **Leaderboards**: Competition and rankings
- **Rewards**: Tokens, NFTs, titles

## 🐳 Docker Deployment

### Development
```bash
docker-compose up -d
```

### Production
```bash
docker build -t boomroach-api .
docker run -p 3001:3001 --env-file .env boomroach-api
```

## 📈 Monitoring & Logging

### Logging
- **Winston Logger**: Structured JSON logs
- **Log Levels**: Error, Warn, Info, Debug
- **File Rotation**: Automatic log rotation
- **Request Logging**: Morgan HTTP logs

### Health Checks
- **Endpoint**: `GET /health`
- **Database**: Connection status
- **External APIs**: Service availability
- **WebSocket**: Connection stats

### Metrics
- **Active Connections**: Real-time WebSocket connections
- **API Performance**: Response times and error rates
- **Database**: Query performance and connection pool
- **Price Updates**: Update frequency and latency

## 🔄 Development Workflow

### Scripts
```bash
bun run dev          # Start development server
bun run build        # Build for production
bun run start        # Start production server
bun run test         # Run tests
bun run lint         # Lint code
bun run db:migrate   # Run database migrations
bun run db:seed      # Seed database
```

### Code Style
- **ESLint + Biome**: Code linting and formatting
- **TypeScript**: Strict type checking
- **Prisma**: Type-safe database access
- **Zod**: Runtime type validation

## 🚀 Deployment

### Vercel/Netlify Functions
- Convert to serverless functions
- Environment variable configuration
- Database connection pooling

### Traditional VPS
- Docker container deployment
- Nginx reverse proxy
- SSL certificate setup
- Process management with PM2

### Cloud Platforms
- AWS ECS/Fargate
- Google Cloud Run
- Digital Ocean App Platform

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new features
4. Ensure all tests pass
5. Submit pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

- **Documentation**: API docs at `/api-docs`
- **Health Check**: Status at `/health`
- **Issues**: GitHub issues for bug reports
- **Discord**: Community support channel

---

**BoomRoach 2025 - The Ultimate Solana Meme Coin Trading Platform! 🪳💎🚀**
