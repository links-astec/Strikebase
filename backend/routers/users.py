"""User profile routes."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from middleware.auth import require_user
import database as db

router = APIRouter(prefix="/users", tags=["users"])


class ProfileUpdate(BaseModel):
    display_name: Optional[str] = None
    skills: Optional[list[str]] = None
    hourly_rate: Optional[float] = None
    experience: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    bio: Optional[str] = None
    onboarded: Optional[bool] = None


@router.get("/me")
async def get_profile(user: dict = Depends(require_user)):
    user_id = user["id"]
    profile = db.get_user_profile(user_id)
    if not profile:
        # Auto-create empty profile
        profile = db.create_user_profile(user_id, user.get("email", ""))
    return profile


@router.put("/me")
async def update_profile(body: ProfileUpdate, user: dict = Depends(require_user)):
    user_id = user["id"]
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    profile = db.update_user_profile(user_id, updates)
    return profile
