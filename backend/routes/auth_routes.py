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
    user_data["plain_password"] = user.password
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

# --- Forgot Password API ---
class SendOtpPayload(BaseModel):
    email: str

class VerifyOtpPayload(BaseModel):
    email: str
    otp: str

class ResetPasswordPayload(BaseModel):
    email: str
    otp: str
    new_password: str

@router.post("/auth/forgot-password/send-otp")
def send_otp(data: SendOtpPayload):
    email = data.email.strip()
    user = user_collection.find_one({"email": email})
    if not user:
        return {"success": False, "message": "Email address not registered."}
        
    otp = str(random.randint(100000, 999999))
    
    # Save OTP verification to MongoDB collection "otps"
    db["otps"].delete_many({"email": email})
    db["otps"].insert_one({
        "email": email,
        "otp": otp,
        "created_at": datetime.datetime.utcnow()
    })
    
    # Send verification email via SMTP
    from services.email_service import get_html_template, _send_smtp_email
    subject, html_content = get_html_template(
        "otp", 
        user.get("username", "User"), 
        {"otp": otp, "subject": "Password Reset OTP Verification"}
    )
    
    status, err = _send_smtp_email(email, subject, html_content)
    if status == "Sent":
        return {"success": True, "message": "Verification code (OTP) sent successfully to your Gmail."}
    else:
        # Development / Fallback mode: return the OTP in response message if SMTP is not configured
        print(f"\n[DEV FALLBACK] SMTP Dispatch failed: {err}. Generated OTP for {email}: {otp}\n")
        return {
            "success": True,
            "message": f"Verification code sent (SMTP config bypassed. Dev OTP: {otp})"
        }

@router.post("/auth/forgot-password/verify-otp")
def verify_otp(data: VerifyOtpPayload):
    email = data.email.strip()
    otp_code = data.otp.strip()
    
    entry = db["otps"].find_one({"email": email, "otp": otp_code})
    if not entry:
        return {"success": False, "message": "Invalid or expired OTP code."}
        
    created_at = entry.get("created_at")
    if created_at:
        now = datetime.datetime.utcnow()
        if (now - created_at).total_seconds() > 600:
            db["otps"].delete_many({"email": email})
            return {"success": False, "message": "OTP verification code has expired."}
            
    return {"success": True, "message": "OTP verification successful."}

@router.post("/auth/forgot-password/reset")
def reset_password(data: ResetPasswordPayload):
    email = data.email.strip()
    otp_code = data.otp.strip()
    new_password = data.new_password
    
    entry = db["otps"].find_one({"email": email, "otp": otp_code})
    if not entry:
        return {"success": False, "message": "Invalid or expired OTP verification."}
        
    # Encrypt/hash the new password
    hashed = hash_password(new_password)
    
    # Update password fields in the database
    user_collection.update_one(
        {"email": email},
        {"$set": {"password": hashed, "plain_password": new_password}}
    )
    
    # Clear verified OTP record
    db["otps"].delete_many({"email": email})
    
    return {"success": True, "message": "Your password has been successfully updated."}
