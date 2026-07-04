import os
import json
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, Float, String, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Config database URL, fallback to SQLite locally
DATABASE_URL = os.getenv("DATABASE_URL") or os.getenv("POSTGRES_URL") or "sqlite:///ats_reports.db"

# Force using SQLite if psycopg2 or database configurations are not completely set
if DATABASE_URL.startswith("postgresql"):
    # Replace postgres:// with postgresql:// if needed for newer SQLAlchemy versions
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class ATSReport(Base):
    __tablename__ = "ats_reports"

    id = Column(Integer, primary_key=True, index=True)
    candidate_name = Column(String(255), default="Unknown Candidate", index=True)
    job_title = Column(String(255), default="General Position", index=True)
    overall_score = Column(Float, nullable=False)
    skills_score = Column(Float, nullable=False)
    experience_score = Column(Float, nullable=False)
    education_score = Column(Float, nullable=False)
    projects_score = Column(Float, nullable=False)
    formatting_score = Column(Float, nullable=False)
    keyword_score = Column(Float, nullable=False)
    
    # Text blobs for JSON arrays/dicts
    missing_skills = Column(Text, default="[]")
    extra_skills = Column(Text, default="[]")
    strengths = Column(Text, default="[]")
    weaknesses = Column(Text, default="[]")
    suggestions = Column(Text, default="[]")
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

# Create all tables on startup
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
