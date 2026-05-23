import os
from datetime import datetime, timedelta
from typing import Any, Dict

from passlib.context import CryptContext
import jwt
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

load_dotenv()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__min_rounds=12)

#Secret configuration
SECRET_KEY = os.getenv("SECRET_KEY", "fallback_temporary_secret_key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

# CRITICAL SECURITY CHECK: If the key isn't found, stop the server immediately
if not SECRET_KEY:
    raise RuntimeError("CRITICAL ERROR: 'SECRET_KEY' environment variable is missing in .env file!")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: Dict[str, Any], expires_delta: int | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(
        minutes=(expires_delta if expires_delta is not None else ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> Dict[str, Any]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


async def get_token_payload(token: str = Depends(oauth2_scheme)) -> Dict[str, Any]:
    """Dependency to get decoded token payload. Does not perform DB lookups — keep DB logic in the route."""
    return decode_access_token(token)