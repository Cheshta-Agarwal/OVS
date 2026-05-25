from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime

# --- USER SCHEMAS ---
# This is what we expect when a user registers
class UserCreate(BaseModel):
    username: str
    password: str

# This is what we send back to the frontend (Notice: No password!)
class UserResponse(BaseModel):
    id: int
    username: str
    has_voted: bool

    # This allows Pydantic to work seamlessly with SQLAlchemy models
    model_config = ConfigDict(from_attributes=True)


# --- CANDIDATE SCHEMAS ---
# This is what a candidate looks like
class CandidateResponse(BaseModel):
    id: int
    name: str
    party: str

    model_config = ConfigDict(from_attributes=True)


# --- VOTE SCHEMAS ---
# This is what the frontend sends when a user clicks a "Vote" button
class VoteCreate(BaseModel):
    candidate_id: int

# This is for the real-time dashboard results
class VoteResult(BaseModel):
    candidate_id: int
    candidate_name: str
    vote_count: int


# --- ENCRYPTED VOTE SCHEMAS ---
class EncryptedVoteCreate(BaseModel):
    ciphertext: str


class EncryptedVoteResponse(BaseModel):
    receipt: str
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)

class CandidateResult(BaseModel):
    id: int
    name: str
    party: str
    vote_count: int

    class Config:
        from_attributes =True