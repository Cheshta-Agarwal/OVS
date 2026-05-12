import asyncio
from sqlalchemy import create_engine, Column, Integer, String, Boolean
from sqlalchemy.orm import sessionmaker, declarative_base

# Setup for the script
DATABASE_URL = "sqlite:///./voting.db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

# Define the Model inside the script to avoid import issues
class Candidate(Base):
    __tablename__ = "candidates"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    party = Column(String)

def seed():
    db = SessionLocal()
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    candidates = [
        {"name": "Arjun Sharma", "party": "Tech Party"},
        {"name": "Priya Kaur", "party": "Innovation Group"},
        {"name": "Rahul Verma", "party": "Future Alliance"}
    ]

    try:
        for cand in candidates:
            exists = db.query(Candidate).filter(Candidate.name == cand["name"]).first()
            if not exists:
                new_cand = Candidate(name=cand["name"], party=cand["party"])
                db.add(new_cand)
        db.commit()
        print("✅ Candidates seeded successfully!")
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed()