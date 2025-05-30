from telegram import Update
from telegram.ext import ContextTypes

async def start_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("🐞 Welcome to HYDRABOT — Boomroach's Trading Bot!\n"
                                    "Use /trade TOKEN AMOUNT to test a manual trade.\n"
                                    "Use /balance to view your funds.")
