from telegram import Update
from telegram.ext import ContextTypes
from backend.services.trading_service import execute_trade

async def trade(update: Update, context: ContextTypes.DEFAULT_TYPE):
    try:
        args = context.args
        if len(args) < 2:
            await update.message.reply_text("Usage: /trade <token> <amount>")
            return

        token = args[0]
        amount = float(args[1])

        result = execute_trade(token, amount)

        if result["status"] == "success":
            await update.message.reply_text(
                f"✅ Trade executed for {result['amount']} {result['token']}.\n"
                f"🕒 {result['timestamp']}\n"
                f"🔗 TxHash: {result['tx_hash']}"
            )
        else:
            await update.message.reply_text("❌ Trade failed. Please try again.")
    except Exception as e:
        await update.message.reply_text(f"❌ Error: {e}")
