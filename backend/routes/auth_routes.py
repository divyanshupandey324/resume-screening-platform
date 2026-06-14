from fastapi import APIRouter
from models.user import User
from services.auth_service import (
    hash_password,
    verify_password
)
from database.mongodb import user_collection

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