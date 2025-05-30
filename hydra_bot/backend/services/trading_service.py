from solana.rpc.api import Client
from solana.transaction import Transaction
from solana.publickey import PublicKey
from solana.system_program import TransferParams, transfer
from config.keys.keys import SOLANA_PRIVATE_KEY
from utils.helpers import load_wallet
from datetime import datetime
import logging

def get_best_route(token):
    return {
        "to_token": token,
        "min_output": 0.9,
        "route": ["SOL", token]
    }

async def execute_trade(token: str, amount: float):
    try:
        client = Client("https://api.mainnet-beta.solana.com")
        wallet = load_wallet(SOLANA_PRIVATE_KEY)
        pubkey = wallet.public_key

        route = get_best_route(token)
        recipient = PublicKey("ReplaceWithActualTokenProgram")
        lamports = int(amount * 1_000_000_000)

        tx = Transaction().add(
            transfer(TransferParams(from_pubkey=pubkey, to_pubkey=recipient, lamports=lamports))
        )

        response = client.send_transaction(tx, wallet)
        return {
            "status": "success",
            "token": token,
            "amount": amount,
            "tx_hash": response.get("result"),
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logging.error(f"Trade failed: {e}")
        return {"status": "error", "error": str(e)}
