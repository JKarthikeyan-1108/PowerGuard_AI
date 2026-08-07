import sys
import os

# Add the parent directory of 'src' to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from src.api.router import train_theft, train_bill, train_forecast, train_cluster
import asyncio

async def main():
    print("Training Theft Model...")
    await train_theft()
    
    print("Training Bill Model...")
    await train_bill()
    
    print("Training Forecast Model...")
    await train_forecast()
    
    print("Training Cluster Model...")
    await train_cluster()
    
    print("All models trained and saved!")

if __name__ == "__main__":
    asyncio.run(main())
