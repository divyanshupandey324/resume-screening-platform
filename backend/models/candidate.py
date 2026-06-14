from pydantic import BaseModel
from typing import List


class Candidate(BaseModel):

    name: str
    email: str

    tenth_percentage: float
    twelfth_percentage: float

    graduation_cgpa: float

    experience_years: float

    skills: List[str]

    projects: List[str]

    certificates: List[str]

    achievements: List[str]