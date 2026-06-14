from database.mongodb import (
    candidate_collection
)

from services.job_matcher import (
    calculate_job_match
)

from services.ranking_engine import (
    rank_candidates
)

from services.analytics_engine import (
    generate_analytics
)
from fastapi import APIRouter

from models.job import Job

from database.mongodb import (
    job_collection
)

router = APIRouter()


@router.post(
    "/job/save"
)
def save_job(
        job: Job
):

    job_collection.insert_one(
        job.dict()
    )

    return {

        "message":
        "Job Saved Successfully"
    }


@router.get(
    "/job/all"
)
def get_jobs():

    jobs = []

    for job in job_collection.find():

        job["_id"] = str(
            job["_id"]
        )

        jobs.append(
            job
        )

    return jobs
@router.post(
    "/job/match"
)
def match_candidate_to_job(
        data: dict
):

    candidate_skills = data[
        "candidate_skills"
    ]

    required_skills = data[
        "required_skills"
    ]

    result = calculate_job_match(

        candidate_skills,

        required_skills

    )

    return result
@router.get(
    "/candidate/rankings"
)
def candidate_rankings():

    candidates = []

    for candidate in candidate_collection.find():

        candidate["_id"] = str(
            candidate["_id"]
        )

        candidates.append(
            candidate
        )

    ranked = rank_candidates(
        candidates
    )

    return ranked
@router.get(
    "/analytics"
)
def analytics():

    candidates = []

    for candidate in candidate_collection.find():

        candidate["_id"] = str(
            candidate["_id"]
        )

        candidates.append(
            candidate
        )

    result = generate_analytics(
        candidates
    )

    return result