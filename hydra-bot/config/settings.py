"""
Hydra Bot Configuration System
Centralized settings management for all services
"""

import os
from typing import List, Optional
from functools import lru_cache
from pydantic import BaseSettings, validator, Field
from decimal import Decimal

class Settings(BaseSettings):
    """Main configuration class for Hydra Bot"""
    
    # =================================
    # Environment Configuration
    # =================================
    ENVIRONMENT: str = Field(default="development", env="ENVIRONMENT")
    DEBUG: bool = Field(default=True, env="DEBUG")
    
    # =================================
    # Database Configuration
    # =================================
    DATABASE_URL: str = Field(..., env="DATABASE_URL")
    REDIS_URL: str = Field(..., env="REDIS_URL")
    
    # Database pool settings
    DB_POOL_SIZE: int = Field(default=20, env="DB_POOL_SIZE")
    DB_MAX_OVERFLOW: int = Field(default=30, env="DB_MAX_OVERFLOW")
    DB_POOL_TIMEOUT: int = Field(default=30, env="DB_POOL_TIMEOUT")
    
    # Redis settings
    REDIS_POOL_SIZE: int = Field(default=10, env="REDIS_POOL_SIZE")
    REDIS_TIMEOUT: int = Field(default=5, env="REDIS_TIMEOUT")
    
    # =================================
    # Solana Blockchain Configuration
    # =================================
    SOLANA_RPC_URL: str = Field(default="https://api.mainnet-beta.solana.com", env="SOLANA_RPC_URL")
    SOLANA_WS_URL: str = Field(default="wss://api.mainnet-beta.solana.com", env="SOLANA_WS_URL")
    SOLANA_RPC_BACKUP: Optional[str] = Field(default=None, env="SOLANA_RPC_BACKUP")
    SOLANA_RPC_HELIUS: Optional[str] = Field(default=None, env="SOLANA_RPC_HELIUS")
    
    # Connection settings
    SOLANA_TIMEOUT: int = Field(default=30, env="SOLANA_TIMEOUT")
    SOLANA_MAX_RETRIES: int = Field(default=3, env="SOLANA_MAX_RETRIES")
    SOLANA_RETRY_DELAY: float = Field(default=1.0, env="SOLANA_RETRY_DELAY")
    
    # =================================
    # Wallet Configuration
    # =================================
    PRIVATE_KEY: str = Field(..., env="PRIVATE_KEY")
    TREASURY_WALLET: str = Field(..., env="TREASURY_WALLET")
    BOOMROACH_TOKEN_MINT: str = Field(..., env="BOOMROACH_TOKEN_MINT")
    
    # =================================
    # Trading Parameters
    # =================================
    MAX_SLIPPAGE: Decimal = Field(default=Decimal("1.0"), env="MAX_SLIPPAGE")
    PRIORITY_FEE: Decimal = Field(default=Decimal("0.01"), env="PRIORITY_FEE")
    MAX_POSITION_SIZE: Decimal = Field(default=Decimal("10.0"), env="MAX_POSITION_SIZE")
    COMMISSION_RATE: Decimal = Field(default=Decimal("0.015"), env="COMMISSION_RATE")
    
    # Trading limits
    MIN_TRADE_AMOUNT: Decimal = Field(default=Decimal("0.001"), env="MIN_TRADE_AMOUNT")
    MAX_TRADE_AMOUNT: Decimal = Field(default=Decimal("100.0"), env="MAX_TRADE_AMOUNT")
    
    # =================================
    # Risk Management
    # =================================
    MAX_DAILY_LOSS: Decimal = Field(default=Decimal("5.0"), env="MAX_DAILY_LOSS")
    STOP_LOSS_PERCENTAGE: Decimal = Field(default=Decimal("15.0"), env="STOP_LOSS_PERCENTAGE")
    MAX_OPEN_POSITIONS: int = Field(default=5, env="MAX_OPEN_POSITIONS")
    
    # Risk thresholds
    RISK_WARNING_THRESHOLD: Decimal = Field(default=Decimal("3.0"), env="RISK_WARNING_THRESHOLD")
    RISK_CRITICAL_THRESHOLD: Decimal = Field(default=Decimal("7.0"), env="RISK_CRITICAL_THRESHOLD")
    
    # =================================
    # AI & External APIs
    # =================================
    OPENAI_API_KEY: str = Field(..., env="OPENAI_API_KEY")
    COINGECKO_API_KEY: Optional[str] = Field(default=None, env="COINGECKO_API_KEY")
    JUPITER_API_URL: str = Field(default="https://quote-api.jup.ag/v6", env="JUPITER_API_URL")
    DEXSCREENER_API_URL: str = Field(default="https://api.dexscreener.com/latest", env="DEXSCREENER_API_URL")
    
    # AI settings
    OPENAI_MODEL: str = Field(default="gpt-4-1106-preview", env="OPENAI_MODEL")
    OPENAI_TEMPERATURE: float = Field(default=0.3, env="OPENAI_TEMPERATURE")
    OPENAI_MAX_TOKENS: int = Field(default=1000, env="OPENAI_MAX_TOKENS")
    
    # =================================
    # Social Media APIs
    # =================================
    TWITTER_BEARER_TOKEN: Optional[str] = Field(default=None, env="TWITTER_BEARER_TOKEN")
    DISCORD_BOT_TOKEN: Optional[str] = Field(default=None, env="DISCORD_BOT_TOKEN")
    
    # =================================
    # Telegram Bot
    # =================================
    TELEGRAM_BOT_TOKEN: str = Field(..., env="TELEGRAM_BOT_TOKEN")
    TELEGRAM_WEBHOOK_URL: Optional[str] = Field(default=None, env="TELEGRAM_WEBHOOK_URL")
    TELEGRAM_ADMIN_IDS: List[int] = Field(default_factory=list, env="TELEGRAM_ADMIN_IDS")
    
    @validator('TELEGRAM_ADMIN_IDS', pre=True)
    def parse_admin_ids(cls, v):
        if isinstance(v, str):
            return [int(x.strip()) for x in v.split(',') if x.strip()]
        return v
    
    # =================================
    # JWT & Authentication
    # =================================
    JWT_SECRET: str = Field(..., env="JWT_SECRET")
    JWT_EXPIRES_IN: str = Field(default="7d", env="JWT_EXPIRES_IN")
    JWT_ALGORITHM: str = Field(default="HS256", env="JWT_ALGORITHM")
    
    # =================================
    # Engine Toggles
    # =================================
    TRADING_ENABLED: bool = Field(default=True, env="TRADING_ENABLED")
    SNIPER_ENABLED: bool = Field(default=True, env="SNIPER_ENABLED")
    REENTRY_ENABLED: bool = Field(default=True, env="REENTRY_ENABLED")
    AI_SIGNALS_ENABLED: bool = Field(default=True, env="AI_SIGNALS_ENABLED")
    GUARDIAN_ENABLED: bool = Field(default=True, env="GUARDIAN_ENABLED")
    
    # =================================
    # Sniper Engine Configuration
    # =================================
    MIN_LIQUIDITY: Decimal = Field(default=Decimal("10.0"), env="MIN_LIQUIDITY")
    SNIPER_MAX_BUY: Decimal = Field(default=Decimal("1.0"), env="SNIPER_MAX_BUY")
    SNIPER_REACTION_TIME: int = Field(default=2000, env="SNIPER_REACTION_TIME")  # milliseconds
    
    # =================================
    # Re-entry Engine Configuration
    # =================================
    MOMENTUM_THRESHOLD: Decimal = Field(default=Decimal("0.15"), env="MOMENTUM_THRESHOLD")
    VOLUME_SPIKE_THRESHOLD: Decimal = Field(default=Decimal("3.0"), env="VOLUME_SPIKE_THRESHOLD")
    RSI_OVERSOLD: int = Field(default=30, env="RSI_OVERSOLD")
    RSI_OVERBOUGHT: int = Field(default=70, env="RSI_OVERBOUGHT")
    
    # =================================
    # AI Signal Engine Configuration
    # =================================
    MIN_SIGNAL_CONFIDENCE: Decimal = Field(default=Decimal("0.7"), env="MIN_SIGNAL_CONFIDENCE")
    SENTIMENT_WEIGHT: Decimal = Field(default=Decimal("0.3"), env="SENTIMENT_WEIGHT")
    TECHNICAL_WEIGHT: Decimal = Field(default=Decimal("0.7"), env="TECHNICAL_WEIGHT")
    
    # =================================
    # Treasury Management
    # =================================
    TREASURY_ENABLED: bool = Field(default=True, env="TREASURY_ENABLED")
    BURN_SCHEDULE: str = Field(default="0 0 * * 0", env="BURN_SCHEDULE")  # Weekly on Sunday
    MIN_TREASURY_BALANCE: Decimal = Field(default=Decimal("100.0"), env="MIN_TREASURY_BALANCE")
    
    # =================================
    # Monitoring & Logging
    # =================================
    LOG_LEVEL: str = Field(default="INFO", env="LOG_LEVEL")
    SENTRY_DSN: Optional[str] = Field(default=None, env="SENTRY_DSN")
    DISCORD_ALERT_WEBHOOK: Optional[str] = Field(default=None, env="DISCORD_ALERT_WEBHOOK")
    
    # =================================
    # API Rate Limits
    # =================================
    JUPITER_RATE_LIMIT: int = Field(default=120, env="JUPITER_RATE_LIMIT")  # per minute
    COINGECKO_RATE_LIMIT: int = Field(default=50, env="COINGECKO_RATE_LIMIT")
    OPENAI_RATE_LIMIT: int = Field(default=60, env="OPENAI_RATE_LIMIT")
    
    # =================================
    # Backup & Recovery
    # =================================
    BACKUP_ENABLED: bool = Field(default=True, env="BACKUP_ENABLED")
    BACKUP_SCHEDULE: str = Field(default="0 2 * * *", env="BACKUP_SCHEDULE")  # Daily at 2 AM
    BACKUP_RETENTION_DAYS: int = Field(default=30, env="BACKUP_RETENTION_DAYS")
    
    # =================================
    # Security
    # =================================
    INTERNAL_API_KEY: str = Field(..., env="INTERNAL_API_KEY")
    WEBHOOK_SECRET: str = Field(..., env="WEBHOOK_SECRET")
    
    # CORS settings
    ALLOWED_ORIGINS: List[str] = Field(
        default=[
            "http://localhost:3000",
            "https://same-w8d506aclf1-latest.netlify.app",
            "https://boomroach.com"
        ],
        env="ALLOWED_ORIGINS"
    )
    
    @validator('ALLOWED_ORIGINS', pre=True)
    def parse_allowed_origins(cls, v):
        if isinstance(v, str):
            return [x.strip() for x in v.split(',') if x.strip()]
        return v
    
    # =================================
    # Development Tools
    # =================================
    DEV_MODE: bool = Field(default=False, env="DEV_MODE")
    MOCK_TRADING: bool = Field(default=False, env="MOCK_TRADING")
    DEBUG_WEBSOCKET: bool = Field(default=False, env="DEBUG_WEBSOCKET")
    
    # =================================
    # Performance Tuning
    # =================================
    WORKER_THREADS: int = Field(default=4, env="WORKER_THREADS")
    MAX_CONCURRENT_TRADES: int = Field(default=10, env="MAX_CONCURRENT_TRADES")
    
    # WebSocket settings
    WS_PING_INTERVAL: int = Field(default=25, env="WS_PING_INTERVAL")  # seconds
    WS_PING_TIMEOUT: int = Field(default=5, env="WS_PING_TIMEOUT")
    
    # =================================
    # Notification Settings
    # =================================
    ENABLE_TRADE_NOTIFICATIONS: bool = Field(default=True, env="ENABLE_TRADE_NOTIFICATIONS")
    ENABLE_RISK_ALERTS: bool = Field(default=True, env="ENABLE_RISK_ALERTS")
    ENABLE_SIGNAL_NOTIFICATIONS: bool = Field(default=True, env="ENABLE_SIGNAL_NOTIFICATIONS")
    ENABLE_TREASURY_NOTIFICATIONS: bool = Field(default=True, env="ENABLE_TREASURY_NOTIFICATIONS")
    
    # =================================
    # Feature Flags
    # =================================
    ENABLE_ADVANCED_ANALYTICS: bool = Field(default=True, env="ENABLE_ADVANCED_ANALYTICS")
    ENABLE_SOCIAL_TRADING: bool = Field(default=False, env="ENABLE_SOCIAL_TRADING")
    ENABLE_COPY_TRADING: bool = Field(default=False, env="ENABLE_COPY_TRADING")
    ENABLE_PORTFOLIO_OPTIMIZATION: bool = Field(default=True, env="ENABLE_PORTFOLIO_OPTIMIZATION")
    
    # =================================
    # API URLs
    # =================================
    BACKEND_API_URL: str = Field(default="http://localhost:3001", env="BACKEND_API_URL")
    TRADING_API_URL: str = Field(default="http://localhost:8000", env="TRADING_API_URL")
    FRONTEND_URL: str = Field(default="http://localhost:3000", env="FRONTEND_URL")
    
    # =================================
    # Validation and Computed Properties
    # =================================
    
    @validator('COMMISSION_RATE')
    def validate_commission_rate(cls, v):
        if v < 0 or v > Decimal("0.1"):  # Max 10%
            raise ValueError('Commission rate must be between 0 and 0.1 (10%)')
        return v
    
    @validator('MAX_SLIPPAGE')
    def validate_max_slippage(cls, v):
        if v < 0 or v > Decimal("50.0"):  # Max 50%
            raise ValueError('Max slippage must be between 0 and 50')
        return v
    
    @validator('STOP_LOSS_PERCENTAGE')
    def validate_stop_loss(cls, v):
        if v < 0 or v > Decimal("100.0"):
            raise ValueError('Stop loss percentage must be between 0 and 100')
        return v
    
    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"
    
    @property
    def is_development(self) -> bool:
        return self.ENVIRONMENT.lower() == "development"
    
    @property
    def database_config(self) -> dict:
        return {
            "url": self.DATABASE_URL,
            "pool_size": self.DB_POOL_SIZE,
            "max_overflow": self.DB_MAX_OVERFLOW,
            "pool_timeout": self.DB_POOL_TIMEOUT
        }
    
    @property
    def redis_config(self) -> dict:
        return {
            "url": self.REDIS_URL,
            "pool_size": self.REDIS_POOL_SIZE,
            "timeout": self.REDIS_TIMEOUT
        }
    
    @property
    def solana_config(self) -> dict:
        return {
            "rpc_url": self.SOLANA_RPC_URL,
            "ws_url": self.SOLANA_WS_URL,
            "backup_rpc": self.SOLANA_RPC_BACKUP,
            "helius_rpc": self.SOLANA_RPC_HELIUS,
            "timeout": self.SOLANA_TIMEOUT,
            "max_retries": self.SOLANA_MAX_RETRIES,
            "retry_delay": self.SOLANA_RETRY_DELAY
        }
    
    @property
    def trading_config(self) -> dict:
        return {
            "max_slippage": float(self.MAX_SLIPPAGE),
            "priority_fee": float(self.PRIORITY_FEE),
            "max_position_size": float(self.MAX_POSITION_SIZE),
            "commission_rate": float(self.COMMISSION_RATE),
            "min_trade_amount": float(self.MIN_TRADE_AMOUNT),
            "max_trade_amount": float(self.MAX_TRADE_AMOUNT)
        }
    
    @property
    def risk_config(self) -> dict:
        return {
            "max_daily_loss": float(self.MAX_DAILY_LOSS),
            "stop_loss_percentage": float(self.STOP_LOSS_PERCENTAGE),
            "max_open_positions": self.MAX_OPEN_POSITIONS,
            "warning_threshold": float(self.RISK_WARNING_THRESHOLD),
            "critical_threshold": float(self.RISK_CRITICAL_THRESHOLD)
        }
    
    @property
    def engine_config(self) -> dict:
        return {
            "sniper": {
                "enabled": self.SNIPER_ENABLED,
                "min_liquidity": float(self.MIN_LIQUIDITY),
                "max_buy": float(self.SNIPER_MAX_BUY),
                "reaction_time": self.SNIPER_REACTION_TIME
            },
            "reentry": {
                "enabled": self.REENTRY_ENABLED,
                "momentum_threshold": float(self.MOMENTUM_THRESHOLD),
                "volume_spike_threshold": float(self.VOLUME_SPIKE_THRESHOLD),
                "rsi_oversold": self.RSI_OVERSOLD,
                "rsi_overbought": self.RSI_OVERBOUGHT
            },
            "ai_signals": {
                "enabled": self.AI_SIGNALS_ENABLED,
                "min_confidence": float(self.MIN_SIGNAL_CONFIDENCE),
                "sentiment_weight": float(self.SENTIMENT_WEIGHT),
                "technical_weight": float(self.TECHNICAL_WEIGHT)
            },
            "guardian": {
                "enabled": self.GUARDIAN_ENABLED
            }
        }
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True
        validate_assignment = True

@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()

# Environment-specific configurations
class DevelopmentSettings(Settings):
    """Development environment settings"""
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    LOG_LEVEL: str = "DEBUG"
    MOCK_TRADING: bool = True

class ProductionSettings(Settings):
    """Production environment settings"""
    ENVIRONMENT: str = "production"
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"
    DEV_MODE: bool = False
    MOCK_TRADING: bool = False

class TestingSettings(Settings):
    """Testing environment settings"""
    ENVIRONMENT: str = "testing"
    DEBUG: bool = True
    LOG_LEVEL: str = "DEBUG"
    MOCK_TRADING: bool = True
    TRADING_ENABLED: bool = False

def get_settings_for_env(environment: str) -> Settings:
    """Get settings for specific environment"""
    if environment.lower() == "development":
        return DevelopmentSettings()
    elif environment.lower() == "production":
        return ProductionSettings()
    elif environment.lower() == "testing":
        return TestingSettings()
    else:
        return Settings()

# Export commonly used settings
__all__ = [
    "Settings",
    "get_settings",
    "get_settings_for_env",
    "DevelopmentSettings",
    "ProductionSettings",
    "TestingSettings"
]