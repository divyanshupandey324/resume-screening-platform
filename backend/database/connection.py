import os
from pymongo import MongoClient
from dotenv import load_dotenv
import certifi

# Load environment variables from .env file
load_dotenv()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")

# Configure MongoClient with certifi CA bundle to prevent TLS alert internal errors
client = MongoClient(
    MONGO_URL,
    tlsCAFile=certifi.where(),
    serverSelectionTimeoutMS=5000
)

try:
    client.server_info()
    print("MongoDB Connected Successfully")
except Exception as e:
    print("MongoDB Connection Failed")
    print(e)

db = client["ai_recruitment_db"]

# Ensure unique index on username to make query lookup O(1) and speed up authentication routes
try:
    db["users"].create_index("username", unique=True)
    print("Database unique index for 'username' created successfully")
except Exception as e:
    print("Database unique index for 'username' failed to create, creating standard index instead:", e)
    try:
        db["users"].create_index("username")
    except Exception:
        pass

# Ensure standard lookup indexes on candidate and job collections to speed up API queries
try:
    db["users"].create_index("email")
    db["candidates"].create_index("username")
    db["candidates"].create_index("email")
    db["candidates"].create_index("job_id")
    db["candidates"].create_index("status")
    db["candidates"].create_index("score")
    db["candidates"].create_index("applied_at")
    db["jobs"].create_index("recruiter_id")
    
    # New performance indexing setup
    db["notifications"].create_index([("recipient_email", 1), ("created_at", -1)])
    db["coding_submissions"].create_index([("username", 1), ("timestamp", -1)])
    db["coding_submissions"].create_index([("username", 1), ("status", 1)])
    db["coding_bookmarks"].create_index([("username", 1), ("problem_title", 1)])
    db["mcq_results"].create_index([("test_title", 1), ("percentage", -1)])
    db["mcqs"].create_index("password")
    db["coding_questions"].create_index([("category", 1), ("difficulty", 1)])
    db["otps"].create_index("email", unique=True)
    db["otps"].create_index("created_at", expireAfterSeconds=600)
    
    print("Standard database indexes created successfully")
except Exception as e:
    print("Standard database indexes creation failed:", e)

def clear_default_jobs():
    try:
        job_collection = db["jobs"]
        # Delete any pre-seeded jobs that do not have a recruiter_id or company
        job_collection.delete_many({
            "$or": [
                {"recruiter_id": {"$exists": False}},
                {"company": {"$exists": False}},
                {"recruiter_id": "recruiter_default"}
            ]
        })
        print("Cleared default jobs from database successfully.")
    except Exception as err:
        print("Failed to clear default jobs:", err)