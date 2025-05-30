from telegram.ext import ApplicationBuilder
from telegram_bot.handlers.main import register_handlers
from config.keys.keys import TELEGRAM_BOT_TOKEN

def main():
    app = ApplicationBuilder().token(TELEGRAM_BOT_TOKEN).build()
    register_handlers(app)
    print("🐞 Roach invasion has started...")
    app.run_polling()

if __name__ == "__main__":
    main()
