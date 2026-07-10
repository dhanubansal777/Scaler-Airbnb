from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import create_access_token, hash_password, verify_password
from ..database import get_db
from ..deps import get_current_user
from ..utils import is_superhost

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _user_out(db: Session, user: models.User) -> schemas.UserOut:
    return schemas.UserOut(
        id=user.id,
        email=user.email,
        name=user.name,
        avatar_url=user.avatar_url,
        is_host=user.is_host,
        is_superhost=is_superhost(db, user.id) if user.is_host else False,
        created_at=user.created_at,
    )


@router.post("/signup", response_model=schemas.TokenOut, status_code=status.HTTP_201_CREATED)
def signup(payload: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    user = models.User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        name=payload.name,
        avatar_url=f"https://api.dicebear.com/7.x/avataaars/svg?seed={payload.email}",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token(user.id)
    return schemas.TokenOut(access_token=token, user=_user_out(db, user))


@router.post("/login", response_model=schemas.TokenOut)
def login(payload: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    token = create_access_token(user.id)
    return schemas.TokenOut(access_token=token, user=_user_out(db, user))


@router.get("/me", response_model=schemas.UserOut)
def me(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return _user_out(db, current_user)


@router.patch("/become-host", response_model=schemas.UserOut)
def become_host(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    current_user.is_host = True
    db.commit()
    db.refresh(current_user)
    return _user_out(db, current_user)
