"""
Hydra Bot Telegram Interface
Complete Telegram bot with trading commands and real-time notifications
"""

import asyncio
import json
import logging
import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from decimal import Decimal

import telegram
from telegram import (
    Update, InlineKeyboardButton, InlineKeyboardMarkup, 
    KeyboardButton, ReplyKeyboardMarkup, ReplyKeyboardRemove
)
from telegram.ext import (
    Application, CommandHandler, CallbackQueryHandler, 
    MessageHandler, filters, ContextTypes
)
from telegram.constants import ParseMode
import httpx
from loguru import logger

from config.settings import get_settings
from core.database import Database
from core.redis_client import RedisClient
from services.user_service import UserService
from services.trading_service import TradingBotService
from services.portfolio_service import PortfolioService
from services.alert_service import AlertService
from utils.formatters import format_price, format_percentage, format_currency
from utils.keyboards import create_main_menu, create_trading_menu, create_portfolio_menu

settings = get_settings()

class HydraTelegramBot:
    """Main Telegram bot class"""
    
    def __init__(self):
        self.application = None
        self.database = None
        self.redis_client = None
        self.user_service = None
        self.trading_service = None
        self.portfolio_service = None
        self.alert_service = None
        self.is_running = False
        
    async def initialize(self):
        """Initialize bot and services"""
        logger.info("🤖 Initializing Hydra Telegram Bot...")
        
        # Database connection
        self.database = Database(settings.DATABASE_URL)
        await self.database.connect()
        
        # Redis connection
        self.redis_client = RedisClient(settings.REDIS_URL)
        await self.redis_client.connect()
        
        # Initialize services
        self.user_service = UserService(self.database)
        self.trading_service = TradingBotService(
            backend_url=settings.BACKEND_API_URL,
            trading_url=settings.TRADING_API_URL
        )
        self.portfolio_service = PortfolioService(self.database)
        self.alert_service = AlertService(self.redis_client)
        
        # Create Telegram application
        self.application = Application.builder().token(settings.TELEGRAM_BOT_TOKEN).build()
        
        # Register handlers
        await self.register_handlers()
        
        logger.info("✅ Hydra Telegram Bot initialized")
        
    async def register_handlers(self):
        """Register all command and callback handlers"""
        app = self.application
        
        # Command handlers
        app.add_handler(CommandHandler("start", self.start_command))
        app.add_handler(CommandHandler("help", self.help_command))
        app.add_handler(CommandHandler("balance", self.balance_command))
        app.add_handler(CommandHandler("portfolio", self.portfolio_command))
        app.add_handler(CommandHandler("trade", self.trade_command))
        app.add_handler(CommandHandler("alerts", self.alerts_command))
        app.add_handler(CommandHandler("signals", self.signals_command))
        app.add_handler(CommandHandler("withdraw", self.withdraw_command))
        app.add_handler(CommandHandler("settings", self.settings_command))
        app.add_handler(CommandHandler("stats", self.stats_command))
        app.add_handler(CommandHandler("leaderboard", self.leaderboard_command))
        
        # Callback query handlers
        app.add_handler(CallbackQueryHandler(self.handle_callback_query))
        
        # Message handlers
        app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, self.handle_message))
        
        # Error handler
        app.add_error_handler(self.error_handler)
        
    async def start_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /start command"""
        user = update.effective_user
        chat_id = update.effective_chat.id
        
        # Check if user exists
        user_data = await self.user_service.get_user_by_telegram_id(user.id)
        
        if not user_data:
            # New user - show wallet connection
            keyboard = InlineKeyboardMarkup([
                [InlineKeyboardButton("🔗 Connect Wallet", callback_data="connect_wallet")],
                [InlineKeyboardButton("ℹ️ Learn More", callback_data="learn_more")]
            ])
            
            welcome_text = f"""
🔥 **Welcome to Hydra Bot!** 🔥

Hey {user.first_name}! Ready to dominate Solana trading with the most advanced AI-powered bot?

🚀 **What Hydra Bot offers:**
• ⚡ Lightning-fast execution (2-3 seconds)
• 🤖 AI-powered signal generation
• 🛡️ Advanced risk management
• 💎 Real-time portfolio tracking
• 📊 Professional analytics

**Get started by connecting your Solana wallet!**
            """
            
            await update.message.reply_text(
                welcome_text,
                parse_mode=ParseMode.MARKDOWN,
                reply_markup=keyboard
            )
        else:
            # Existing user - show main menu
            keyboard = create_main_menu()
            
            portfolio_value = await self.portfolio_service.get_portfolio_value(user_data['id'])
            daily_pnl = await self.portfolio_service.get_daily_pnl(user_data['id'])
            
            welcome_back_text = f"""
🔥 **Welcome back, {user.first_name}!** 🔥

📊 **Your Portfolio:**
💰 Total Value: **{format_currency(portfolio_value)}**
📈 Today's P&L: **{format_currency(daily_pnl, show_sign=True)}**

🤖 **Hydra Bot Status:** ✅ Active
🎯 **Trading Signals:** ✅ Enabled
🛡️ **Risk Guard:** ✅ Protected

Ready to make some profits? 🚀
            """
            
            await update.message.reply_text(
                welcome_back_text,
                parse_mode=ParseMode.MARKDOWN,
                reply_markup=keyboard
            )
    
    async def balance_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /balance command"""
        user_id = update.effective_user.id
        user_data = await self.user_service.get_user_by_telegram_id(user_id)
        
        if not user_data:
            await update.message.reply_text("❌ Please connect your wallet first using /start")
            return
        
        try:
            # Get portfolio data
            portfolio = await self.portfolio_service.get_portfolio_summary(user_data['id'])
            positions = await self.portfolio_service.get_active_positions(user_data['id'])
            
            balance_text = f"""
💰 **Portfolio Balance**

📊 **Overview:**
💎 Total Value: **{format_currency(portfolio['total_value'])}**
📈 Total P&L: **{format_currency(portfolio['total_pnl'], show_sign=True)}** ({format_percentage(portfolio['total_pnl_percent'])})
📅 Today: **{format_currency(portfolio['daily_pnl'], show_sign=True)}**
📆 This Week: **{format_currency(portfolio['weekly_pnl'], show_sign=True)}**
📊 This Month: **{format_currency(portfolio['monthly_pnl'], show_sign=True)}**

🔥 **Active Positions:** {len(positions)}
            """
            
            if positions:
                balance_text += "\n\n💎 **Top Positions:**\n"
                for pos in positions[:5]:  # Show top 5
                    pnl_emoji = "📈" if pos['unrealized_pnl'] >= 0 else "📉"
                    balance_text += f"{pnl_emoji} **{pos['token_symbol']}**: {format_currency(pos['value'])} ({format_percentage(pos['unrealized_pnl_pct'])})\n"
            
            keyboard = InlineKeyboardMarkup([
                [
                    InlineKeyboardButton("📊 Detailed Portfolio", callback_data="portfolio_detailed"),
                    InlineKeyboardButton("💹 Trading", callback_data="open_trading")
                ],
                [
                    InlineKeyboardButton("🔄 Refresh", callback_data="refresh_balance"),
                    InlineKeyboardButton("🏠 Main Menu", callback_data="main_menu")
                ]
            ])
            
            await update.message.reply_text(
                balance_text,
                parse_mode=ParseMode.MARKDOWN,
                reply_markup=keyboard
            )
            
        except Exception as e:
            logger.error(f"Error in balance command: {e}")
            await update.message.reply_text("❌ Error retrieving balance. Please try again.")
    
    async def trade_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /trade command"""
        user_id = update.effective_user.id
        user_data = await self.user_service.get_user_by_telegram_id(user_id)
        
        if not user_data:
            await update.message.reply_text("❌ Please connect your wallet first using /start")
            return
        
        # Get recent signals
        signals = await self.get_recent_signals(limit=5)
        
        trade_text = "⚡ **Quick Trading Dashboard**\n\n"
        
        if signals:
            trade_text += "🎯 **Latest AI Signals:**\n"
            for signal in signals:
                action_emoji = "🚀" if signal['action'] in ['STRONG_BUY', 'BUY'] else "⚠️" if signal['action'] == 'HOLD' else "🔻"
                confidence_stars = "⭐" * int(signal['confidence'] * 5)
                
                trade_text += f"{action_emoji} **{signal['token_symbol']}** - {signal['action']}\n"
                trade_text += f"   💰 Price: {format_price(signal['price'])}\n"
                trade_text += f"   🎯 Confidence: {confidence_stars} ({signal['confidence']:.1%})\n\n"
        else:
            trade_text += "🔍 No recent signals. Analyzing markets...\n\n"
        
        keyboard = InlineKeyboardMarkup([
            [
                InlineKeyboardButton("🚀 Quick Buy", callback_data="quick_buy"),
                InlineKeyboardButton("📉 Quick Sell", callback_data="quick_sell")
            ],
            [
                InlineKeyboardButton("🎯 View All Signals", callback_data="view_all_signals"),
                InlineKeyboardButton("⚙️ Trading Settings", callback_data="trading_settings")
            ],
            [
                InlineKeyboardButton("📊 Market Analysis", callback_data="market_analysis"),
                InlineKeyboardButton("🏠 Main Menu", callback_data="main_menu")
            ]
        ])
        
        await update.message.reply_text(
            trade_text,
            parse_mode=ParseMode.MARKDOWN,
            reply_markup=keyboard
        )
    
    async def alerts_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /alerts command"""
        user_id = update.effective_user.id
        user_data = await self.user_service.get_user_by_telegram_id(user_id)
        
        if not user_data:
            await update.message.reply_text("❌ Please connect your wallet first using /start")
            return
        
        # Get user's active alerts
        alerts = await self.alert_service.get_user_alerts(user_data['id'])
        
        alerts_text = "🔔 **Your Trading Alerts**\n\n"
        
        if alerts:
            for alert in alerts:
                status_emoji = "✅" if alert['is_active'] else "⏸️"
                alerts_text += f"{status_emoji} **{alert['type']}**\n"
                alerts_text += f"   📍 Token: {alert['token_symbol']}\n"
                alerts_text += f"   💰 Trigger: {alert['trigger_condition']}\n"
                alerts_text += f"   📅 Created: {alert['created_at'].strftime('%m/%d %H:%M')}\n\n"
        else:
            alerts_text += "📭 No active alerts.\n\nSet up alerts to get notified about:\n"
            alerts_text += "• 🎯 Signal triggers\n• 💰 Price movements\n• 🛡️ Risk warnings\n• 📊 Portfolio changes\n\n"
        
        keyboard = InlineKeyboardMarkup([
            [
                InlineKeyboardButton("➕ Create Alert", callback_data="create_alert"),
                InlineKeyboardButton("⚙️ Alert Settings", callback_data="alert_settings")
            ],
            [
                InlineKeyboardButton("🔄 Refresh", callback_data="refresh_alerts"),
                InlineKeyboardButton("🏠 Main Menu", callback_data="main_menu")
            ]
        ])
        
        await update.message.reply_text(
            alerts_text,
            parse_mode=ParseMode.MARKDOWN,
            reply_markup=keyboard
        )
    
    async def withdraw_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /withdraw command"""
        user_id = update.effective_user.id
        user_data = await self.user_service.get_user_by_telegram_id(user_id)
        
        if not user_data:
            await update.message.reply_text("❌ Please connect your wallet first using /start")
            return
        
        # Security check
        keyboard = InlineKeyboardMarkup([
            [
                InlineKeyboardButton("✅ Verify Identity", callback_data="verify_withdrawal"),
                InlineKeyboardButton("❌ Cancel", callback_data="main_menu")
            ]
        ])
        
        withdraw_text = """
🔐 **Secure Withdrawal**

⚠️ **Security Notice:**
Withdrawals require identity verification for your protection.

📋 **Withdrawal Options:**
• 💰 Withdraw SOL
• 🪙 Withdraw specific tokens
• 📊 Withdraw profits only
• 🔄 Convert & withdraw

🛡️ **Security Features:**
• 2FA verification
• Withdrawal limits
• Transaction history
• Real-time monitoring

**Click 'Verify Identity' to proceed securely.**
        """
        
        await update.message.reply_text(
            withdraw_text,
            parse_mode=ParseMode.MARKDOWN,
            reply_markup=keyboard
        )
    
    async def handle_callback_query(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle all callback queries from inline keyboards"""
        query = update.callback_query
        await query.answer()
        
        data = query.data
        user_id = update.effective_user.id
        
        try:
            if data == "connect_wallet":
                await self.handle_connect_wallet(query, context)
            elif data == "main_menu":
                await self.handle_main_menu(query, context)
            elif data == "portfolio_detailed":
                await self.handle_detailed_portfolio(query, context)
            elif data == "open_trading":
                await self.handle_open_trading(query, context)
            elif data == "quick_buy":
                await self.handle_quick_buy(query, context)
            elif data == "quick_sell":
                await self.handle_quick_sell(query, context)
            elif data == "view_all_signals":
                await self.handle_view_signals(query, context)
            elif data == "market_analysis":
                await self.handle_market_analysis(query, context)
            elif data.startswith("execute_signal_"):
                signal_id = data.split("_")[-1]
                await self.handle_execute_signal(query, context, signal_id)
            elif data.startswith("token_details_"):
                token_mint = data.split("_", 2)[-1]
                await self.handle_token_details(query, context, token_mint)
            else:
                await query.edit_message_text("❓ Unknown action. Please try again.")
                
        except Exception as e:
            logger.error(f"Error handling callback query {data}: {e}")
            await query.edit_message_text("❌ An error occurred. Please try again.")
    
    async def handle_connect_wallet(self, query, context):
        """Handle wallet connection process"""
        connect_text = """
🔗 **Connect Your Solana Wallet**

**Step 1:** Visit our secure connection portal:
🌐 https://hydra-bot.boomroach.com/connect

**Step 2:** Connect your wallet (Phantom, Solflare, etc.)

**Step 3:** Sign the verification message

**Step 4:** Return here and click "✅ Verify Connection"

🛡️ **Security:** We never store your private keys. The connection is secured with cryptographic signatures.
        """
        
        keyboard = InlineKeyboardMarkup([
            [InlineKeyboardButton("✅ Verify Connection", callback_data="verify_connection")],
            [InlineKeyboardButton("❓ Need Help?", callback_data="connection_help")],
            [InlineKeyboardButton("🏠 Main Menu", callback_data="main_menu")]
        ])
        
        await query.edit_message_text(
            connect_text,
            parse_mode=ParseMode.MARKDOWN,
            reply_markup=keyboard
        )
    
    async def handle_quick_buy(self, query, context):
        """Handle quick buy interface"""
        # Get trending tokens
        trending = await self.get_trending_tokens()
        
        quick_buy_text = "🚀 **Quick Buy**\n\nSelect a token to buy:\n\n"
        
        keyboard_buttons = []
        for token in trending[:6]:  # Show top 6 trending
            change_emoji = "📈" if token['change_24h'] >= 0 else "📉"
            button_text = f"{change_emoji} {token['symbol']} ({format_percentage(token['change_24h'])})"
            keyboard_buttons.append([
                InlineKeyboardButton(button_text, callback_data=f"buy_token_{token['mint']}")
            ])
        
        keyboard_buttons.extend([
            [InlineKeyboardButton("🔍 Search Token", callback_data="search_token")],
            [InlineKeyboardButton("🏠 Main Menu", callback_data="main_menu")]
        ])
        
        keyboard = InlineKeyboardMarkup(keyboard_buttons)
        
        await query.edit_message_text(
            quick_buy_text,
            parse_mode=ParseMode.MARKDOWN,
            reply_markup=keyboard
        )
    
    async def start_notifications(self):
        """Start listening for real-time notifications"""
        if not self.redis_client:
            return
            
        # Subscribe to trading signals
        pubsub = self.redis_client.pubsub()
        await pubsub.subscribe('trading_signals', 'risk_alerts', 'portfolio_updates')
        
        async for message in pubsub.listen():
            try:
                if message['type'] == 'message':
                    data = json.loads(message['data'])
                    
                    if message['channel'] == 'trading_signals':
                        await self.broadcast_signal_notification(data)
                    elif message['channel'] == 'risk_alerts':
                        await self.broadcast_risk_alert(data)
                    elif message['channel'] == 'portfolio_updates':
                        await self.broadcast_portfolio_update(data)
                        
            except Exception as e:
                logger.error(f"Error processing notification: {e}")
    
    async def broadcast_signal_notification(self, signal_data):
        """Broadcast trading signal to subscribed users"""
        # Get users who want signal notifications
        users = await self.user_service.get_users_with_signal_notifications()
        
        signal_text = f"""
🎯 **NEW TRADING SIGNAL**

🪙 **Token:** {signal_data['token_symbol']}
📊 **Action:** {signal_data['action']}
💰 **Price:** {format_price(signal_data['price'])}
🎯 **Target:** {format_price(signal_data['target_price']) if signal_data['target_price'] else 'N/A'}
🛡️ **Stop Loss:** {format_price(signal_data['stop_loss']) if signal_data['stop_loss'] else 'N/A'}
⭐ **Confidence:** {signal_data['confidence']:.1%}

🤖 **AI Analysis:** {signal_data['reasoning'][:100]}...
        """
        
        keyboard = InlineKeyboardMarkup([
            [
                InlineKeyboardButton("🚀 Execute Trade", callback_data=f"execute_signal_{signal_data['id']}"),
                InlineKeyboardButton("📊 Details", callback_data=f"signal_details_{signal_data['id']}")
            ],
            [InlineKeyboardButton("🔕 Disable Alerts", callback_data="disable_signal_alerts")]
        ])
        
        for user in users:
            try:
                await self.application.bot.send_message(
                    chat_id=user['telegram_id'],
                    text=signal_text,
                    parse_mode=ParseMode.MARKDOWN,
                    reply_markup=keyboard
                )
            except Exception as e:
                logger.error(f"Error sending signal to user {user['id']}: {e}")
    
    async def run(self):
        """Start the Telegram bot"""
        if self.is_running:
            return
            
        self.is_running = True
        logger.info("🚀 Starting Hydra Telegram Bot...")
        
        # Initialize the bot
        await self.application.initialize()
        await self.application.start()
        
        # Start polling for updates
        await self.application.updater.start_polling()
        
        # Start notification listener
        asyncio.create_task(self.start_notifications())
        
        logger.info("✅ Hydra Telegram Bot is running!")
        
        # Keep running
        while self.is_running:
            await asyncio.sleep(1)
    
    async def stop(self):
        """Stop the Telegram bot"""
        self.is_running = False
        if self.application:
            await self.application.stop()
            await self.application.shutdown()
        logger.info("🛑 Hydra Telegram Bot stopped")
    
    async def error_handler(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle errors"""
        logger.error(f"Telegram bot error: {context.error}")
        
        if update.effective_message:
            await update.effective_message.reply_text(
                "❌ An error occurred. Our team has been notified."
            )

# Helper functions and utilities
async def get_recent_signals(limit: int = 10):
    """Get recent trading signals"""
    # This would fetch from the database
    pass

async def get_trending_tokens():
    """Get trending tokens"""
    # This would fetch from external APIs
    pass

# Main execution
async def main():
    bot = HydraTelegramBot()
    await bot.initialize()
    await bot.run()

if __name__ == "__main__":
    asyncio.run(main())