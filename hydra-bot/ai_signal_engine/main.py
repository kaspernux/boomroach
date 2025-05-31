"""
Hydra Bot AI Signal Engine
Advanced token analysis using OpenAI GPT-4, sentiment analysis, and technical indicators
"""

import asyncio
import json
import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum

import openai
import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException, BackgroundTasks
from loguru import logger
import httpx
from sqlalchemy import select
import ta
from textblob import TextBlob

from config.settings import get_settings
from core.database import Database
from core.redis_client import RedisClient
from models.signal import Signal, SignalType, SignalAction, SignalEngine
from services.social_monitor import SocialMonitorService
from services.technical_analyzer import TechnicalAnalyzer
from utils.token_analyzer import TokenAnalyzer

settings = get_settings()

class SignalConfidence(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    VERY_HIGH = "very_high"

@dataclass
class TokenAnalysis:
    """Comprehensive token analysis result"""
    token_mint: str
    symbol: str
    price: float
    market_cap: float
    volume_24h: float
    
    # Technical analysis
    rsi: float
    macd_signal: str
    bollinger_position: float
    volume_profile: str
    support_resistance: Dict[str, float]
    
    # Sentiment analysis
    social_sentiment: float
    news_sentiment: float
    community_activity: int
    influencer_mentions: int
    
    # AI analysis
    ai_recommendation: SignalAction
    ai_confidence: float
    ai_reasoning: str
    target_price: Optional[float]
    stop_loss: Optional[float]
    time_horizon: str
    
    # Risk factors
    risk_score: float
    liquidity_risk: float
    volatility_risk: float
    smart_money_activity: float

class AISignalEngine:
    """AI-powered signal generation engine"""
    
    def __init__(self):
        self.openai_client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.database = None
        self.redis_client = None
        self.social_monitor = None
        self.technical_analyzer = None
        self.token_analyzer = None
        self.is_running = False
        
    async def initialize(self):
        """Initialize all services and connections"""
        logger.info("🤖 Initializing AI Signal Engine...")
        
        # Database connection
        self.database = Database(settings.DATABASE_URL)
        await self.database.connect()
        
        # Redis connection
        self.redis_client = RedisClient(settings.REDIS_URL)
        await self.redis_client.connect()
        
        # Initialize analyzers
        self.social_monitor = SocialMonitorService()
        self.technical_analyzer = TechnicalAnalyzer()
        self.token_analyzer = TokenAnalyzer()
        
        logger.info("✅ AI Signal Engine initialized")
    
    async def start_signal_generation(self):
        """Start the main signal generation loop"""
        if self.is_running:
            return
            
        self.is_running = True
        logger.info("🎯 Starting AI signal generation...")
        
        while self.is_running:
            try:
                # Get tokens to analyze
                tokens = await self.get_tokens_to_analyze()
                
                # Analyze each token
                for token in tokens:
                    try:
                        analysis = await self.analyze_token(token)
                        signal = await self.generate_signal(analysis)
                        
                        if signal:
                            await self.save_signal(signal)
                            await self.broadcast_signal(signal)
                            
                    except Exception as e:
                        logger.error(f"Error analyzing token {token.get('symbol', 'Unknown')}: {e}")
                
                # Wait before next analysis cycle
                await asyncio.sleep(60)  # Analyze every minute
                
            except Exception as e:
                logger.error(f"Error in signal generation loop: {e}")
                await asyncio.sleep(30)
    
    async def analyze_token(self, token: Dict[str, Any]) -> TokenAnalysis:
        """Perform comprehensive token analysis"""
        logger.info(f"🔍 Analyzing token: {token['symbol']}")
        
        # Get price and market data
        price_data = await self.get_price_data(token['mint'])
        
        # Technical analysis
        technical_data = await self.technical_analyzer.analyze(
            token['mint'], 
            timeframe='1h'
        )
        
        # Social sentiment analysis
        social_data = await self.social_monitor.get_sentiment(token['symbol'])
        
        # AI-powered analysis
        ai_analysis = await self.get_ai_analysis(token, price_data, technical_data, social_data)
        
        return TokenAnalysis(
            token_mint=token['mint'],
            symbol=token['symbol'],
            price=price_data['price'],
            market_cap=price_data.get('market_cap', 0),
            volume_24h=price_data.get('volume_24h', 0),
            
            # Technical indicators
            rsi=technical_data['rsi'],
            macd_signal=technical_data['macd_signal'],
            bollinger_position=technical_data['bollinger_position'],
            volume_profile=technical_data['volume_profile'],
            support_resistance=technical_data['support_resistance'],
            
            # Sentiment data
            social_sentiment=social_data['sentiment_score'],
            news_sentiment=social_data['news_sentiment'],
            community_activity=social_data['activity_score'],
            influencer_mentions=social_data['influencer_mentions'],
            
            # AI analysis
            ai_recommendation=SignalAction(ai_analysis['recommendation']),
            ai_confidence=ai_analysis['confidence'],
            ai_reasoning=ai_analysis['reasoning'],
            target_price=ai_analysis.get('target_price'),
            stop_loss=ai_analysis.get('stop_loss'),
            time_horizon=ai_analysis['time_horizon'],
            
            # Risk assessment
            risk_score=ai_analysis['risk_score'],
            liquidity_risk=technical_data['liquidity_risk'],
            volatility_risk=technical_data['volatility_risk'],
            smart_money_activity=social_data['smart_money_activity']
        )
    
    async def get_ai_analysis(
        self, 
        token: Dict[str, Any], 
        price_data: Dict[str, Any],
        technical_data: Dict[str, Any], 
        social_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Get AI-powered analysis using OpenAI GPT-4"""
        
        # Prepare context for AI analysis
        context = f"""
        Analyze the following Solana token for trading opportunities:

        TOKEN INFORMATION:
        - Symbol: {token['symbol']}
        - Name: {token.get('name', 'Unknown')}
        - Current Price: ${price_data['price']:.8f}
        - Market Cap: ${price_data.get('market_cap', 0):,.2f}
        - 24h Volume: ${price_data.get('volume_24h', 0):,.2f}
        - 24h Change: {price_data.get('change_24h', 0):.2f}%

        TECHNICAL INDICATORS:
        - RSI: {technical_data['rsi']:.2f}
        - MACD Signal: {technical_data['macd_signal']}
        - Bollinger Position: {technical_data['bollinger_position']:.2f}
        - Volume Profile: {technical_data['volume_profile']}
        - Support: ${technical_data['support_resistance']['support']:.8f}
        - Resistance: ${technical_data['support_resistance']['resistance']:.8f}
        - Liquidity Risk: {technical_data['liquidity_risk']:.2f}
        - Volatility Risk: {technical_data['volatility_risk']:.2f}

        SOCIAL SENTIMENT:
        - Overall Sentiment: {social_data['sentiment_score']:.2f}
        - News Sentiment: {social_data['news_sentiment']:.2f}
        - Community Activity: {social_data['activity_score']}
        - Influencer Mentions: {social_data['influencer_mentions']}
        - Smart Money Activity: {social_data['smart_money_activity']:.2f}

        Please provide a detailed trading analysis including:
        1. Recommendation (STRONG_BUY, BUY, WEAK_BUY, HOLD, WEAK_SELL, SELL, STRONG_SELL)
        2. Confidence level (0.0 to 1.0)
        3. Detailed reasoning
        4. Target price (if bullish)
        5. Stop loss level
        6. Time horizon (short, medium, long)
        7. Risk score (0.0 to 1.0)
        8. Key factors driving the recommendation

        Respond in JSON format.
        """
        
        try:
            response = await self.openai_client.chat.completions.create(
                model="gpt-4-1106-preview",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert cryptocurrency trader and analyst with deep knowledge of Solana DeFi. Provide precise, actionable trading recommendations based on technical analysis, sentiment data, and market conditions. Focus on risk management and realistic price targets."
                    },
                    {
                        "role": "user",
                        "content": context
                    }
                ],
                temperature=0.3,
                max_tokens=1000,
                response_format={"type": "json_object"}
            )
            
            analysis = json.loads(response.choices[0].message.content)
            
            return {
                'recommendation': analysis.get('recommendation', 'HOLD'),
                'confidence': float(analysis.get('confidence', 0.5)),
                'reasoning': analysis.get('reasoning', 'No reasoning provided'),
                'target_price': analysis.get('target_price'),
                'stop_loss': analysis.get('stop_loss'),
                'time_horizon': analysis.get('time_horizon', 'medium'),
                'risk_score': float(analysis.get('risk_score', 0.5)),
                'key_factors': analysis.get('key_factors', [])
            }
            
        except Exception as e:
            logger.error(f"Error getting AI analysis: {e}")
            return {
                'recommendation': 'HOLD',
                'confidence': 0.0,
                'reasoning': f'AI analysis failed: {str(e)}',
                'target_price': None,
                'stop_loss': None,
                'time_horizon': 'unknown',
                'risk_score': 1.0,
                'key_factors': []
            }
    
    async def generate_signal(self, analysis: TokenAnalysis) -> Optional[Signal]:
        """Generate trading signal from analysis"""
        
        # Minimum confidence threshold
        if analysis.ai_confidence < settings.MIN_SIGNAL_CONFIDENCE:
            logger.debug(f"Signal confidence too low for {analysis.symbol}: {analysis.ai_confidence}")
            return None
        
        # Risk checks
        if analysis.risk_score > 0.8:
            logger.warning(f"Risk score too high for {analysis.symbol}: {analysis.risk_score}")
            return None
        
        # Determine signal type
        signal_type = SignalType.BUY if analysis.ai_recommendation in [
            SignalAction.STRONG_BUY, SignalAction.BUY, SignalAction.WEAK_BUY
        ] else SignalType.SELL
        
        # Create signal
        signal = Signal(
            token_mint=analysis.token_mint,
            engine=SignalEngine.AI_ANALYSIS,
            type=signal_type,
            action=analysis.ai_recommendation,
            confidence=analysis.ai_confidence,
            price=analysis.price,
            target_price=analysis.target_price,
            stop_loss=analysis.stop_loss,
            timeframe=analysis.time_horizon,
            reasoning={
                'ai_reasoning': analysis.ai_reasoning,
                'technical_factors': {
                    'rsi': analysis.rsi,
                    'macd_signal': analysis.macd_signal,
                    'bollinger_position': analysis.bollinger_position
                },
                'sentiment_factors': {
                    'social_sentiment': analysis.social_sentiment,
                    'news_sentiment': analysis.news_sentiment,
                    'community_activity': analysis.community_activity
                },
                'risk_factors': {
                    'overall_risk': analysis.risk_score,
                    'liquidity_risk': analysis.liquidity_risk,
                    'volatility_risk': analysis.volatility_risk
                }
            },
            metadata={
                'market_cap': analysis.market_cap,
                'volume_24h': analysis.volume_24h,
                'smart_money_activity': analysis.smart_money_activity,
                'support_level': analysis.support_resistance['support'],
                'resistance_level': analysis.support_resistance['resistance']
            }
        )
        
        logger.info(f"📊 Generated {signal_type.value} signal for {analysis.symbol} "
                   f"(confidence: {analysis.ai_confidence:.2f})")
        
        return signal
    
    async def get_tokens_to_analyze(self) -> List[Dict[str, Any]]:
        """Get list of tokens to analyze"""
        try:
            # Get tokens from database
            async with self.database.get_session() as session:
                # Get top tokens by volume and market cap
                query = """
                SELECT DISTINCT t.mint, t.symbol, t.name, tp.volume_24h, tp.market_cap
                FROM tokens t
                JOIN token_prices tp ON t.id = tp.token_id
                WHERE tp.timestamp > NOW() - INTERVAL '1 hour'
                  AND t.is_scam = false
                  AND tp.volume_24h > 10000
                ORDER BY tp.volume_24h DESC
                LIMIT 50
                """
                
                result = await session.execute(query)
                tokens = [dict(row) for row in result.fetchall()]
                
            # Also include trending tokens from social media
            trending_tokens = await self.social_monitor.get_trending_tokens()
            
            # Combine and deduplicate
            all_tokens = tokens + trending_tokens
            unique_tokens = {token['mint']: token for token in all_tokens}
            
            return list(unique_tokens.values())[:25]  # Analyze top 25
            
        except Exception as e:
            logger.error(f"Error getting tokens to analyze: {e}")
            return []
    
    async def get_price_data(self, token_mint: str) -> Dict[str, Any]:
        """Get current price and market data for token"""
        try:
            # Try to get from cache first
            cache_key = f"price_data:{token_mint}"
            cached_data = await self.redis_client.get(cache_key)
            
            if cached_data:
                return json.loads(cached_data)
            
            # Fetch from Jupiter/DexScreener
            async with httpx.AsyncClient() as client:
                # Try Jupiter first
                response = await client.get(
                    f"https://price.jup.ag/v4/price?ids={token_mint}"
                )
                
                if response.status_code == 200:
                    data = response.json()
                    price_info = data.get('data', {}).get(token_mint, {})
                    
                    price_data = {
                        'price': float(price_info.get('price', 0)),
                        'market_cap': None,  # Jupiter doesn't provide this
                        'volume_24h': None,
                        'change_24h': None
                    }
                    
                    # Try to get additional data from DexScreener
                    try:
                        dex_response = await client.get(
                            f"https://api.dexscreener.com/latest/dex/tokens/{token_mint}"
                        )
                        
                        if dex_response.status_code == 200:
                            dex_data = dex_response.json()
                            if dex_data.get('pairs'):
                                pair = dex_data['pairs'][0]  # Get first pair
                                price_data.update({
                                    'market_cap': float(pair.get('fdv', 0)),
                                    'volume_24h': float(pair.get('volume', {}).get('h24', 0)),
                                    'change_24h': float(pair.get('priceChange', {}).get('h24', 0))
                                })
                    except:
                        pass  # DexScreener data is optional
                    
                    # Cache for 30 seconds
                    await self.redis_client.setex(
                        cache_key, 30, json.dumps(price_data)
                    )
                    
                    return price_data
            
            # Fallback values
            return {
                'price': 0.0,
                'market_cap': 0,
                'volume_24h': 0,
                'change_24h': 0
            }
            
        except Exception as e:
            logger.error(f"Error getting price data for {token_mint}: {e}")
            return {
                'price': 0.0,
                'market_cap': 0,
                'volume_24h': 0,
                'change_24h': 0
            }
    
    async def save_signal(self, signal: Signal):
        """Save signal to database"""
        try:
            async with self.database.get_session() as session:
                # Convert signal to database record
                signal_record = {
                    'token_mint': signal.token_mint,
                    'engine': signal.engine.value,
                    'type': signal.type.value,
                    'action': signal.action.value,
                    'confidence': signal.confidence,
                    'price': signal.price,
                    'target_price': signal.target_price,
                    'stop_loss': signal.stop_loss,
                    'timeframe': signal.timeframe,
                    'reasoning': signal.reasoning,
                    'metadata': signal.metadata,
                    'status': 'ACTIVE',
                    'created_at': datetime.utcnow()
                }
                
                await session.execute(
                    "INSERT INTO signals (...) VALUES (...)",
                    signal_record
                )
                await session.commit()
                
            logger.info(f"💾 Saved signal for {signal.token_mint}")
            
        except Exception as e:
            logger.error(f"Error saving signal: {e}")
    
    async def broadcast_signal(self, signal: Signal):
        """Broadcast signal to Redis for real-time distribution"""
        try:
            signal_data = {
                'token_mint': signal.token_mint,
                'type': signal.type.value,
                'action': signal.action.value,
                'confidence': signal.confidence,
                'price': signal.price,
                'target_price': signal.target_price,
                'stop_loss': signal.stop_loss,
                'reasoning': signal.reasoning,
                'timestamp': datetime.utcnow().isoformat()
            }
            
            # Publish to Redis channel
            await self.redis_client.publish(
                'trading_signals',
                json.dumps(signal_data)
            )
            
            logger.info(f"📡 Broadcasted signal for {signal.token_mint}")
            
        except Exception as e:
            logger.error(f"Error broadcasting signal: {e}")
    
    async def stop(self):
        """Stop the signal generation engine"""
        self.is_running = False
        logger.info("🛑 AI Signal Engine stopped")

# FastAPI app for AI Signal Engine
app = FastAPI(title="Hydra Bot AI Signal Engine", version="1.0.0")

engine = AISignalEngine()

@app.on_event("startup")
async def startup():
    await engine.initialize()
    asyncio.create_task(engine.start_signal_generation())

@app.on_event("shutdown")
async def shutdown():
    await engine.stop()

@app.get("/")
async def root():
    return {
        "name": "Hydra Bot AI Signal Engine",
        "version": "1.0.0",
        "status": "operational" if engine.is_running else "stopped"
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy" if engine.is_running else "unhealthy",
        "timestamp": datetime.utcnow().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)