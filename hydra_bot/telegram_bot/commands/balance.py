from telegram import Update
from telegram.ext import ContextTypes
from utils.helpers import get_mock_balance

async def balance_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    balance = get_mock_balance()
    await update.message.reply_text(
        f"💰 Balance:\nUSDT: {balance['usdt']}\n🐞$BOOMROACH: {balance['boomroach']}"
    )
