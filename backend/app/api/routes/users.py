from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdateProfile
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/profile", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    """Retrieve profile of the logged-in user."""
    return current_user


@router.put("/profile", response_model=UserResponse)
def update_profile(
    update_in: UserUpdateProfile,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user's full name."""
    current_user.full_name = update_in.full_name.strip()
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user
