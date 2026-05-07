from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base

# 1. Define the Database URL
# This will create a file named 'voting.db' in your backend folder.
DATABASE_URL = "sqlite+aiosqlite:///./voting.db"

# 2. Create the Async Engine
# echo=True allows you to see the SQL queries in your terminal (great for debugging!)
engine = create_async_engine(DATABASE_URL, echo=True)

# 3. Create a Session factory
AsyncSessionLocal = sessionmaker(
    bind=engine, 
    class_=AsyncSession, 
    expire_on_commit=False
)

# 4. Create a Base class for our models to inherit from
Base = declarative_base()

# 5. Dependency to get a DB session for each request
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session