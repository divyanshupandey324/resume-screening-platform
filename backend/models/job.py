from pydantic import BaseModel
from typing import List, Optional

class Job(BaseModel):
    title: str
    description: str
    required_skills: List[str]
    preferred_skills: List[str] = []
    minimum_experience: float
    experience: Optional[float] = None
    location: str = ""
    salary: str = ""
    job_type: str = ""
    company: str = "Unknown Company"
    min_ats_score: float = 50.0
    ats_threshold: Optional[float] = None
    deadline: str = ""
    recruiter_id: str = ""