from passlib.context import CryptContext
import jwt
from datetime import datetime,timedelta

pwd_context=CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__min_rounds=12)

import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "fallback_temporary_secret_key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

# CRITICAL SECURITY CHECK: If the key isn't found, stop the server immediately
if not SECRET_KEY:
    raise RuntimeError("CRITICAL ERROR: 'SECRET_KEY' environment variable is missing in .env file!")

def hash_password(password:str) ->str :
    return pwd_context.hash(password)

def verify_password(plain_password:str, hashed_password:str) ->bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data:dict) ->str:
    to_encode=data.copy()
    expire=datetime.utcnow() +timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp":expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

