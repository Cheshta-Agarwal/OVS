import asyncio
from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from sqlalchemy import func
import security

import models
import seed_data
import schemas # This uses the schemas we made earlier
from database import engine, get_db

from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
import jwt

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
# List the exact origins (URLs) allowed to talk to your backend
origins = [
    "http://localhost:5173",  # Typical Vite/React local server URL
    "http://localhost:3000",  # Typical Create-React-App local server URL
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,            # Allows requests from your frontend origins
    allow_credentials=True,
    allow_methods=["*"],              # Allows all HTTP methods (GET, POST, PUT, DELETE)
    allow_headers=["*"],              # Allows all headers (including Authorization header!)
)


@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(models.Base.metadata.create_all)
    await asyncio.to_thread(seed_data.seed)

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
async def login_user(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: AsyncSession = Depends(get_db)
):
    # Find user by username (we use form_data.username instead of user_data.username)
    result = await db.execute(select(models.User).filter(models.User.username == form_data.username))
    user = result.scalars().first()
    
    # Verify user exists and password matches
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid credentials"
        )
    
    # Generate token
    token_data = {"sub": user.username, "user_id": user.id}
    access_token = security.create_access_token(data=token_data)
    
    return {"access_token": access_token, "token_type": "bearer"}

# Define the security scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession= Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # Decode the token using the secret key from your .env
        payload= jwt.decode(token,security.SECRET_KEY, algorithms= [security.ALGORITHM])
        username: str =payload.get("sub")
        if username is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    
    result= await db.execute(select(models.User).filter(models.User.username == username))
    user = result.scalars().first()
    if user is None:
        raise credentials_exception
    return user


@app.get("/me", response_model=schemas.UserResponse)
async def read_current_user(current_user: models.User = Depends(get_current_user)):
    return current_user

@app.post("/vote", status_code = status.HTTP_200_OK)
async def cast_vote(vote_data: schemas.VoteCreate,
                    current_user:models.User = Depends(get_current_user),
                    db: AsyncSession = Depends(get_db)):
    #check if user has already casted vote
    if current_user.has_voted:
        raise HTTPException(
            status_code =status.HTTP_400_BAD_REQUEST,
            detail="You have already voted!!",
        )
    
    #check if cadidate existed
    result = await db.execute(select(models.Candidate).filter(models.Candidate.id == vote_data.candidate_id))
    candidate = result.scalars().first()
    if not candidate:
        raise HTTPException(
            status_code =status.HTTP_404_NOT_FOUND,
            detail="candidate not found!!",
        )
    
    #record the vote casted by user
    new_vote= models.Vote(candidate_id=vote_data.candidate_id)
    db.add(new_vote)
    current_user.has_voted = True
    await db.commit()
    #Note: we are not adding user_id to vote table for letting vote be anonymous.
    return {"message": "Vote casted successfully! Thank you for participating."}

#GET /results - publicly readable live dashboard results
@app.get("/results", response_model=List[schemas.CandidateResult])
async def get_results(db: AsyncSession = Depends(get_db)):
    #Query candidate and count their associated votes using an outer join to include candidates with zero votes
    query=(select(models.Candidate.id,
                  models.Candidate.name,
                  models.Candidate.party,
                  func.count(models.Vote.id).label("vote_count")
                  )
                  .outerjoin(models.Vote, models.Candidate.id == models.Vote.candidate_id)
                  .group_by(models.Candidate.id)
                  .order_by(func.count(models.Vote.id).desc()) #highest vote on top

    )
    result =await db.execute(query)

    # Map raw rows directly into a dictionary format matching our schema
    results_list =[]
    for row in result:
        results_list.append({"id":row[0], "name":row[1], 
                             "party":row[2], "vote_count":row[3]})
    return results_list
