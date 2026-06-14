import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")

client = MongoClient(
    MONGO_URL,
    serverSelectionTimeoutMS=5000
)

try:
    client.server_info()
    print("MongoDB Connected Successfully")
except Exception as e:
    print("MongoDB Connection Failed")
    print(e)

db = client["ai_recruitment_db"]

def seed_jobs_if_empty():
    try:
        job_collection = db["jobs"]
        if job_collection.count_documents({}) == 0:
            default_jobs = [
                {
                    "title": "Software Engineer",
                    "description": "Develop and maintain software applications using modern tech stacks.",
                    "required_skills": ["python", "sql", "machine learning", "fastapi", "docker", "aws"],
                    "minimum_experience": 2.0
                },
                {
                    "title": "Frontend Developer",
                    "description": "Responsible for building the user interface of our web applications.",
                    "required_skills": ["react", "javascript", "typescript", "html5", "css3", "tailwind", "vite"],
                    "minimum_experience": 1.0
                },
                {
                    "title": "Backend Developer",
                    "description": "Design, build and configure databases, APIs, and backend logic.",
                    "required_skills": ["python", "fastapi", "django", "postgresql", "mongodb", "redis", "docker"],
                    "minimum_experience": 2.0
                },
                {
                    "title": "Full Stack Engineer",
                    "description": "Work on both front-end and back-end portions of applications.",
                    "required_skills": ["react", "node.js", "express", "mongodb", "javascript", "aws", "docker"],
                    "minimum_experience": 3.0
                },
                {
                    "title": "AI/ML Engineer",
                    "description": "Design and build AI/ML systems and integrate LLMs.",
                    "required_skills": ["python", "pytorch", "tensorflow", "scikit-learn", "machine learning", "deep learning", "nlp", "llms"],
                    "minimum_experience": 2.0
                },
                {
                    "title": "DevOps Engineer",
                    "description": "Manage deployment pipelines and cloud infrastructure.",
                    "required_skills": ["docker", "kubernetes", "aws", "ci/cd", "jenkins", "terraform", "linux", "git"],
                    "minimum_experience": 3.0
                },
                {
                    "title": "Data Scientist",
                    "description": "Extract insights from data and build predictive ML models.",
                    "required_skills": ["python", "sql", "pandas", "numpy", "matplotlib", "scikit-learn", "data analysis"],
                    "minimum_experience": 1.5
                },
                {
                    "title": "UI/UX Designer",
                    "description": "Design intuitive user journeys and high-fidelity interfaces.",
                    "required_skills": ["figma", "wireframing", "prototyping", "ui design", "user research"],
                    "minimum_experience": 1.0
                }
            ]
            job_collection.insert_many(default_jobs)
            print("Successfully seeded default jobs in MongoDB")
    except Exception as err:
        print("Failed to seed default jobs:", err)

seed_jobs_if_empty()