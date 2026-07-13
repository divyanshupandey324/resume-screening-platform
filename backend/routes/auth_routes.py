from fastapi import APIRouter
from models.user import User
from services.auth_service import (
    hash_password,
    verify_password
)
from database.mongodb import user_collection
from database.connection import db
from services.email_service import send_email_notification
import random
import datetime
from pydantic import BaseModel

router = APIRouter()



@router.post("/register")
def register(
        user: User
):
    existing = user_collection.find_one({"username": user.username})
    if existing:
        return {
            "message": "User already exists"
        }

    if user.email:
        existing_email = user_collection.find_one({"email": user.email})
        if existing_email:
            return {
                "message": "Email already registered"
            }

    hashed = hash_password(
        user.password
    )

    user_data = user.dict()
    user_data["password"] = hashed
    user_data["role"] = user.role.lower()

    user_collection.insert_one(user_data)



    return {
        "message": "User Registered"
    }


@router.post("/login")
def login(
        user: User
):
    db_user = user_collection.find_one({"username": user.username})
    if db_user:
        if verify_password(user.password, db_user["password"]):
            return {
                "message": "Login Success",
                "role": db_user.get("role", "candidate")
            }
        else:
            return {
                "message": "Invalid Credentials"
            }

    return {
        "message": "Invalid User"
    }
