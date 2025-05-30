from pymongo import MongoClient

client = MongoClient("mongodb+srv://<username>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority")
db = client["hydra_bot"]

pnl_collection = db["pnl"]
trades_collection = db["trades"]
config_collection = db["configs"]