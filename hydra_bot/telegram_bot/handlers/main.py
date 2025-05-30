from telegram.ext import ApplicationBuilder, CommandHandler
from telegram_bot.commands.start import start_handler
from telegram_bot.commands.balance import balance_handler
from telegram_bot.commands.trade import trade_handler

def register_handlers(app):
    app.add_handler(CommandHandler("start", start_handler))
    app.add_handler(CommandHandler("balance", balance_handler))
    app.add_handler(CommandHandler("trade", trade_handler))
