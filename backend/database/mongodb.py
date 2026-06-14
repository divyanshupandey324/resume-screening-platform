from database.connection import db


candidate_collection = db[
    "candidates"
]

recruiter_collection = db[
    "recruiters"
]

job_collection = db[
    "jobs"
]

user_collection = db[
    "users"
]