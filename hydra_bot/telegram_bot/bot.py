from telegram.ext import ApplicationBuilder, CommandHandler
from handlers.main import start
from commands.trade import trade

# Placeholder for backend integration
from backend.services.trading_service import execute_trade  # Assume future implementation
