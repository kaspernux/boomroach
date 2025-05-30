from pydantic import BaseModel
from datetime import datetime

class Trade(BaseModel):
    token: str
    amount: float
    tx_hash: str
    timestamp: datetime
