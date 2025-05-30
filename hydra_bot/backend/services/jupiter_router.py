import requests

def get_best_jupiter_route(input_mint, output_mint, amount):
    url = "https://quote-api.jup.ag/v4/quote"
    params = {
        "inputMint": input_mint,
        "outputMint": output_mint,
        "amount": amount,
        "slippageBps": 50,
    }
    try:
        response = requests.get(url, params=params)
        return response.json()
    except Exception as e:
        return {"error": str(e)}