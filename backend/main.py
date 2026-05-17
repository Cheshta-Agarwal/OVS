from fastapi import FastAPI, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

import models
import schemas # This uses the schemas we made earlier
from database import engine, get_db

from fastapi import HTTPException, status
import security


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

# 1. USER REGISTRATION ROUTE
@app.post("/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(user_data: schemas.UserCreate, db: AsyncSession = Depends(get_db)):
    # Check if username already exists
    result = await db.execute(select(models.User).filter(models.User.username == user_data.username))
    existing_user = result.scalars().first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Username already registered"
        )
    
    # Hash the password before saving! (Thanks, Member C!)
    hashed_pwd = security.hash_password(user_data.password)
    
    # Create new user instance
    new_user = models.User(username=user_data.username, hashed_password=hashed_pwd)
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user


# 2. USER LOGIN ROUTE (Returns JWT Token)
@app.post("/login")
async def login_user(user_data: schemas.UserCreate, db: AsyncSession = Depends(get_db)):
    # Find user by username
    result = await db.execute(select(models.User).filter(models.User.username == user_data.username))
    user = result.scalars().first()
    
    # Verify user exists and password matches
    if not user or not security.verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid credentials"
        )
    
    # Generate token
    token_data = {"sub": user.username, "user_id": user.id}
    access_token = security.create_access_token(data=token_data)
    
    return {"access_token": access_token, "token_type": "bearer"}