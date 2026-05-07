from fastapi import FastAPI
import models
from database import engine

app = FastAPI()

# This "startup" event runs as soon as you start the server
@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        # This line looks at models.py and creates the tables if they don't exist
        await conn.run_sync(models.Base.metadata.create_all)

@app.get("/")
async def root():
    return {"message": "Voting System Backend is Online and Tables are Created!"}