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

class ForgotPasswordSendOTP(BaseModel):
    email: str

class ForgotPasswordReset(BaseModel):
    email: str
    otp: str
    new_password: str

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

    # Trigger welcome email if email or username is an email
    target_email = user.email if user.email else (user.username if "@" in user.username else "")
    if target_email:
        try:
            send_email_notification("registration", target_email, target_email.split("@")[0], {})
        except Exception as e:
            print("Failed to send welcome email:", e)

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

@router.post("/forgot-password/send-otp")
def send_otp(payload: ForgotPasswordSendOTP):
    email = payload.email.strip().lower()
    user = user_collection.find_one({"$or": [{"email": email}, {"username": email}]})
    if not user:
        return {"success": False, "message": "Email address not found"}
    
    otp = f"{random.randint(100000, 999999)}"
    db["otps"].update_one(
        {"email": email},
        {"$set": {"otp": otp, "created_at": datetime.datetime.utcnow()}},
        upsert=True
    )
    
    try:
        recipient_name = user.get("username", email.split("@")[0])
        send_email_notification("otp", email, recipient_name, {
            "subject": "Password Reset Verification Code",
            "otp": otp,
            "message": f"Your verification code for password reset is {otp}. This code is valid for 10 minutes."
        })
    except Exception as e:
        print("Failed to send OTP email:", e)
        return {"success": False, "message": "Failed to send verification email"}
        
    return {"success": True, "message": "Verification code sent successfully"}

@router.post("/forgot-password/reset")
def reset_password(payload: ForgotPasswordReset):
    email = payload.email.strip().lower()
    otp = payload.otp.strip()
    new_password = payload.new_password.strip()
    
    if not new_password:
        return {"success": False, "message": "New password cannot be empty"}
        
    otp_doc = db["otps"].find_one({"email": email})
    if not otp_doc or otp_doc.get("otp") != otp:
        return {"success": False, "message": "Invalid or expired verification code"}
        
    hashed = hash_password(new_password)
    user_collection.update_one(
        {"$or": [{"email": email}, {"username": email}]},
        {"$set": {"password": hashed}}
    )
    db["otps"].delete_one({"email": email})
    
    return {"success": True, "message": "Password updated successfully"}