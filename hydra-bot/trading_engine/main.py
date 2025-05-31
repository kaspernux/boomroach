"""
Hydra Bot Trading Engine - Main FastAPI Application
Advanced Solana trading system with AI signals and risk management
"""

import asyncio
import logging
import os
from contextlib import asynccontextmanager
from typing import Dict, Any

import uvicorn
from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from loguru import logger
from prometheus_client import make_asgi_app, Counter, Histogram, Gauge
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

# Local imports
from config.settings import get_settings
from core.database import Database
from core.redis_client import RedisClient
from core.solana_client import SolanaClient
from services.jupiter_service import JupiterService
from services.trading_service import TradingService
from services.risk_service import RiskService
from services.portfolio_service import PortfolioService
from middleware.auth import AuthMiddleware
from middleware.rate_limit import RateLimitMiddleware
from routers import trading, signals, portfolio, risk, analytics, websocket
from utils.exceptions import setup_exception_handlers
from utils.logging_config import setup_logging

# Initialize settings
settings = get_settings()

# Setup logging
setup_logging()

# Initialize Sentry for error tracking
if settings.SENTRY_DSN:
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        integrations=[FastApiIntegration(auto_enable=True)],
        traces_sample_rate=0.1,
        environment=settings.ENVIRONMENT
    )

# Prometheus metrics
REQUEST_COUNT = Counter('trading_engine_requests_total', 'Total requests', ['method', 'endpoint'])
REQUEST_DURATION = Histogram('trading_engine_request_duration_seconds', 'Request duration')
ACTIVE_TRADES = Gauge('trading_engine_active_trades', 'Number of active trades')
PORTFOLIO_VALUE = Gauge('trading_engine_portfolio_value_usd', 'Total portfolio value in USD')

# Global service instances
database: Database = None
redis_client: RedisClient = None
solana_client: SolanaClient = None
jupiter_service: JupiterService = None
trading_service: TradingService = None
risk_service: RiskService = None
portfolio_service: PortfolioService = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    logger.info("🚀 Starting Hydra Bot Trading Engine...")
    
    try:
        # Initialize core services
        global database, redis_client, solana_client
        global jupiter_service, trading_service, risk_service, portfolio_service
        
        # Database connection
        database = Database(settings.DATABASE_URL)
        await database.connect()
        logger.info("✅ Database connected")
        
        # Redis connection
        redis_client = RedisClient(settings.REDIS_URL)
        await redis_client.connect()
        logger.info("✅ Redis connected")
        
        # Solana blockchain connection
        solana_client = SolanaClient(
            rpc_url=settings.SOLANA_RPC_URL,
            ws_url=settings.SOLANA_WS_URL
        )
        await solana_client.connect()
        logger.info("✅ Solana client connected")
        
        # Jupiter aggregator service
        jupiter_service = JupiterService(solana_client)
        await jupiter_service.initialize()
        logger.info("✅ Jupiter service initialized")
        
        # Core trading services
        trading_service = TradingService(
            database=database,
            redis_client=redis_client,
            solana_client=solana_client,
            jupiter_service=jupiter_service
        )
        await trading_service.initialize()
        logger.info("✅ Trading service initialized")
        
        # Risk management service
        risk_service = RiskService(
            database=database,
            redis_client=redis_client,
            trading_service=trading_service
        )
        await risk_service.initialize()
        logger.info("✅ Risk service initialized")
        
        # Portfolio tracking service
        portfolio_service = PortfolioService(
            database=database,
            solana_client=solana_client
        )
        await portfolio_service.initialize()
        logger.info("✅ Portfolio service initialized")
        
        # Start background tasks
        asyncio.create_task(start_background_tasks())
        
        logger.info("🎯 Hydra Bot Trading Engine fully initialized!")
        
        yield
        
    except Exception as e:
        logger.error(f"❌ Failed to initialize trading engine: {e}")
        raise
    
    # Shutdown
    logger.info("🛑 Shutting down Hydra Bot Trading Engine...")
    
    try:
        # Stop services gracefully
        if trading_service:
            await trading_service.shutdown()
        if risk_service:
            await risk_service.shutdown()
        if portfolio_service:
            await portfolio_service.shutdown()
        if jupiter_service:
            await jupiter_service.shutdown()
        if solana_client:
            await solana_client.disconnect()
        if redis_client:
            await redis_client.disconnect()
        if database:
            await database.disconnect()
            
        logger.info("✅ All services shut down gracefully")
        
    except Exception as e:
        logger.error(f"❌ Error during shutdown: {e}")

# Create FastAPI application
app = FastAPI(
    title="Hydra Bot Trading Engine",
    description="Advanced Solana trading system with AI signals and risk management",
    version="1.0.0",
    docs_url="/docs" if settings.ENVIRONMENT == "development" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT == "development" else None,
    lifespan=lifespan
)

# Add middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add custom middleware
app.add_middleware(AuthMiddleware)
app.add_middleware(RateLimitMiddleware)

# Setup exception handlers
setup_exception_handlers(app)

# Add Prometheus metrics endpoint
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

# Include routers
app.include_router(trading.router, prefix="/api/v1/trading", tags=["Trading"])
app.include_router(signals.router, prefix="/api/v1/signals", tags=["Signals"])
app.include_router(portfolio.router, prefix="/api/v1/portfolio", tags=["Portfolio"])
app.include_router(risk.router, prefix="/api/v1/risk", tags=["Risk Management"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["Analytics"])
app.include_router(websocket.router, prefix="/api/v1/ws", tags=["WebSocket"])

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "name": "Hydra Bot Trading Engine",
        "version": "1.0.0",
        "status": "operational",
        "description": "Advanced Solana trading system for BoomRoach ecosystem",
        "features": [
            "AI-powered signal generation",
            "Lightning-fast execution (2-3 seconds)",
            "Comprehensive risk management",
            "Jupiter aggregator integration",
            "Real-time portfolio tracking"
        ],
        "engines": {
            "sniper": settings.SNIPER_ENABLED,
            "reentry": settings.REENTRY_ENABLED,
            "ai_signals": settings.AI_SIGNALS_ENABLED,
            "guardian": settings.GUARDIAN_ENABLED
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Check database connection
        db_healthy = await database.health_check() if database else False
        
        # Check Redis connection
        redis_healthy = await redis_client.health_check() if redis_client else False
        
        # Check Solana connection
        solana_healthy = await solana_client.health_check() if solana_client else False
        
        # Overall health status
        healthy = db_healthy and redis_healthy and solana_healthy
        
        return {
            "status": "healthy" if healthy else "unhealthy",
            "timestamp": asyncio.get_event_loop().time(),
            "services": {
                "database": "ok" if db_healthy else "error",
                "redis": "ok" if redis_healthy else "error",
                "solana": "ok" if solana_healthy else "error"
            },
            "metrics": {
                "active_trades": ACTIVE_TRADES._value._value,
                "portfolio_value": PORTFOLIO_VALUE._value._value
            }
        }
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "error": str(e),
                "timestamp": asyncio.get_event_loop().time()
            }
        )

@app.get("/status")
async def status():
    """Detailed status endpoint"""
    try:
        trading_stats = await trading_service.get_stats() if trading_service else {}
        risk_stats = await risk_service.get_stats() if risk_service else {}
        portfolio_stats = await portfolio_service.get_stats() if portfolio_service else {}
        
        return {
            "engine": "Hydra Bot Trading Engine",
            "version": "1.0.0",
            "uptime": asyncio.get_event_loop().time(),
            "environment": settings.ENVIRONMENT,
            "trading": trading_stats,
            "risk": risk_stats,
            "portfolio": portfolio_stats,
            "configuration": {
                "max_slippage": settings.MAX_SLIPPAGE,
                "priority_fee": settings.PRIORITY_FEE,
                "max_position_size": settings.MAX_POSITION_SIZE,
                "commission_rate": settings.COMMISSION_RATE
            }
        }
        
    except Exception as e:
        logger.error(f"Status check failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def start_background_tasks():
    """Start background monitoring and maintenance tasks"""
    logger.info("🔄 Starting background tasks...")
    
    # Start portfolio monitoring
    if portfolio_service:
        asyncio.create_task(portfolio_service.start_monitoring())
    
    # Start risk monitoring
    if risk_service:
        asyncio.create_task(risk_service.start_monitoring())
    
    # Start trading engine if enabled
    if trading_service and settings.TRADING_ENABLED:
        asyncio.create_task(trading_service.start_engines())
    
    # Update metrics periodically
    asyncio.create_task(update_metrics())
    
    logger.info("✅ Background tasks started")

async def update_metrics():
    """Update Prometheus metrics periodically"""
    while True:
        try:
            if trading_service:
                stats = await trading_service.get_stats()
                ACTIVE_TRADES.set(stats.get("active_trades", 0))
            
            if portfolio_service:
                stats = await portfolio_service.get_stats()
                PORTFOLIO_VALUE.set(stats.get("total_value_usd", 0))
                
        except Exception as e:
            logger.error(f"Error updating metrics: {e}")
        
        await asyncio.sleep(30)  # Update every 30 seconds

# Dependency injection
def get_database() -> Database:
    return database

def get_redis() -> RedisClient:
    return redis_client

def get_solana_client() -> SolanaClient:
    return solana_client

def get_trading_service() -> TradingService:
    return trading_service

def get_risk_service() -> RiskService:
    return risk_service

def get_portfolio_service() -> PortfolioService:
    return portfolio_service

if __name__ == "__main__":
    # Development server
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.ENVIRONMENT == "development",
        log_level="info"
    )