from pydantic import BaseModel

from typing import List


class Job(
    BaseModel
):

    title: str

    description: str

    required_skills: List[str]

    minimum_experience: float