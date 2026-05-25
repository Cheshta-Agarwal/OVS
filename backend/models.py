from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    # This flag is Member B's best friend—it prevents double voting!
    has_voted = Column(Boolean, default=False)

class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    party = Column(String)

class Vote(Base):
    __tablename__ = "votes"

    id = Column(Integer, primary_key=True, index=True)
    # We store the ID of the candidate who received the vote
    candidate_id = Column(Integer, ForeignKey("candidates.id"))
    
    # PRO-TIP: To keep votes anonymous, we do NOT link this table back to the User table.


class EncryptedBallot(Base):
    __tablename__ = "encrypted_ballots"

    id = Column(Integer, primary_key=True, index=True)
    ciphertext = Column(Text, nullable=False)
    timestamp = Column(DateTime, server_default=func.now(), nullable=False)