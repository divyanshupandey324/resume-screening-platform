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


@router.post("/job/save")
def save_job(job: Job):
    job_data = job.dict()
    if job_data.get("experience") is None:
        job_data["experience"] = job.minimum_experience
    if job_data.get("ats_threshold") is None:
        job_data["ats_threshold"] = job.min_ats_score
    job_collection.insert_one(job_data)
    return {"message": "Job Saved Successfully"}


@router.get(
    "/job/all"
)
def get_jobs(skip: int = 0, limit: int = 100):

    jobs = []

    for job in job_collection.find().skip(skip).limit(limit):

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
def candidate_rankings(skip: int = 0, limit: int = 100):

    candidates = []

    for candidate in candidate_collection.find({}, {"name": 1, "score": 1}).skip(skip).limit(limit):

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
    try:
        pipeline = [
            {
                "$group": {
                    "_id": None,
                    "total_candidates": {"$sum": 1},
                    "shortlisted": {
                        "$sum": {
                            "$cond": [{"$gte": ["$score", 50]}, 1, 0]
                        }
                    },
                    "total_score": {"$sum": "$score"},
                    "total_skill_match": {"$sum": "$skill_match"}
                }
            }
        ]
        results = list(candidate_collection.aggregate(pipeline))
        if not results:
            return {
                "total_candidates": 0,
                "shortlisted": 0,
                "rejected": 0,
                "average_score": 0.0,
                "average_skill_match": 0.0
            }
        res = results[0]
        total = res["total_candidates"]
        shortlisted = res["shortlisted"]
        avg_score = round(res["total_score"] / total, 2) if total > 0 else 0.0
        avg_skill_match = round(res["total_skill_match"] / total, 2) if total > 0 else 0.0
        return {
            "total_candidates": total,
            "shortlisted": shortlisted,
            "rejected": total - shortlisted,
            "average_score": avg_score,
            "average_skill_match": avg_skill_match
        }
    except Exception as e:
        print("Aggregation analytics failed, falling back:", e)
        candidates = []
        for candidate in candidate_collection.find({}, {"score": 1, "skill_match": 1}):
            candidate["_id"] = str(candidate["_id"])
            candidates.append(candidate)
        return generate_analytics(candidates)