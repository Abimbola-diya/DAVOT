from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
import secrets

from app.database import get_db
from app.models import User
from app.schemas import UserLogin, GoogleAuthLogin, AuthTokenResponse, UserResponse

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/login", response_model=AuthTokenResponse)
def login_user(payload: UserLogin, db: Session = Depends(get_db)):
    if not payload.email:
        raise HTTPException(status_code=400, detail="Email address is required")
    
    clean_email = payload.email.strip().lower()
    
    # Find or create user
    user = db.query(User).filter(User.email == clean_email).first()
    if not user:
        user = User(
            email=clean_email,
            hashed_password=payload.password or "secret_pass",
            full_name=clean_email.split('@')[0].capitalize() or "Seun",
            role=payload.role or "view"
        )
        db.add(user)
    else:
        # Update user's active role selected on auth screen
        if payload.role:
            user.role = payload.role
            
    db.commit()
    db.refresh(user)
    
    token = f"davot_token_{secrets.token_hex(16)}"
    
    return AuthTokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(
            id=user.id,
            email=user.email,
            full_name=user.full_name or "Seun",
            role=user.role
        )
    )

@router.post("/google", response_model=AuthTokenResponse)
def google_auth(payload: GoogleAuthLogin, db: Session = Depends(get_db)):
    email = payload.email or "google.user@davot.farm"
    clean_email = email.strip().lower()
    
    user = db.query(User).filter(User.email == clean_email).first()
    if not user:
        user = User(
            email=clean_email,
            full_name=payload.name or "Seun",
            role=payload.role or "view"
        )
        db.add(user)
    else:
        if payload.role:
            user.role = payload.role
            
    db.commit()
    db.refresh(user)
    
    token = f"davot_google_token_{secrets.token_hex(16)}"
    
    return AuthTokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(
            id=user.id,
            email=user.email,
            full_name=user.full_name or "Seun",
            role=user.role
        )
    )

@router.get("/me", response_model=UserResponse)
def get_current_user(email: Optional[str] = None, db: Session = Depends(get_db)):
    if email:
        user = db.query(User).filter(User.email == email.strip().lower()).first()
        if user:
            return UserResponse(
                id=user.id,
                email=user.email,
                full_name=user.full_name or "Seun",
                role=user.role
            )
    return UserResponse(
        id=1,
        email="seun@davot.farm",
        full_name="Seun",
        role="view"
    )
