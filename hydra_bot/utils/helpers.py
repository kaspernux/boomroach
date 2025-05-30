from solana.keypair import Keypair
from base58 import b58decode

def load_wallet(private_key_str):
    secret = b58decode(private_key_str)
    return Keypair.from_secret_key(secret)

def get_mock_balance():
    return {"usdt": "123.45", "boomroach": "69.42"}
