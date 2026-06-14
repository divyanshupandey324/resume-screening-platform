import bcrypt

def hash_password(password: str) -> str:
    # Encode password to bytes
    password_bytes = password.encode('utf-8')
    # Generate salt and hash
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    # Return as string
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        # Encode inputs to bytes
        plain_bytes = plain_password.encode('utf-8')
        hashed_bytes = hashed_password.encode('utf-8')
        # Check password
        return bcrypt.checkpw(plain_bytes, hashed_bytes)
    except Exception as e:
        print("Password verification failed:", e)
        return False