import asyncio
import websockets
import json

async def listen_to_logs():
    uri = "wss://api.mainnet-beta.solana.com/"
    async with websockets.connect(uri) as websocket:
        subscription = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "logsSubscribe",
            "params": [
                {"mentions": ["ProgramPublicKey"]},
                {"commitment": "finalized"}
            ]
        }
        await websocket.send(json.dumps(subscription))
        while True:
            response = await websocket.recv()
            print(response)