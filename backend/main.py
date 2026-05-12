from fastapi import FastAPI, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

import models
import schemas # This uses the schemas we made earlier
from database import engine, get_db

app = FastAPI()

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(models.Base.metadata.create_all)

@app.get("/")
async def root():
    return {"message": "Backend is Online"}

# NEW ROUTE: This is what Member A (Frontend) will call
@app.get("/candidates", response_model=List[schemas.CandidateResponse])
async def get_candidates(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Candidate))
    candidates = result.scalars().all()
    return candidates