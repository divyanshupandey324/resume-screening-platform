from database.mongodb import (
    candidate_collection
)

from fastapi import APIRouter

from models.candidate import Candidate

from services.scoring_engine import (
    calculate_score
)

from services.skill_matcher import (
    match_skills
)

from services.ai_summary import (
    generate_candidate_summary
)

from services.recommendation_engine import (
    recommend_skills
)

from services.interview_generator import (
    generate_questions
)

router = APIRouter()


@router.post("/candidate/evaluate")
def evaluate_candidate(
        candidate: Candidate
):

    score = calculate_score(
        candidate
    )

    return {

        "candidate":
        candidate.name,

        "score":
        score

    }


@router.post("/candidate/skill-match")
def skill_match(
        data: dict
):

    candidate_skills = data[
        "candidate_skills"
    ]

    required_skills = data[
        "required_skills"
    ]

    result = match_skills(

        candidate_skills,

        required_skills

    )

    return result


@router.post(
    "/candidate/summary"
)
def candidate_summary(
        candidate: Candidate
):

    score = calculate_score(
        candidate
    )

    summary = generate_candidate_summary(

        candidate,

        score

    )

    return {

        "summary":
        summary

    }


@router.post(
    "/candidate/recommend"
)
def recommend(
        data: dict
):

    result = recommend_skills(

        data["candidate_skills"],

        data["required_skills"]

    )

    return result


@router.post(
    "/candidate/interview"
)
def interview_questions(
        data: dict
):

    questions = generate_questions(

        data["skills"]

    )

    return {

        "questions":
        questions

    }


@router.post(
    "/candidate/save"
)
def save_candidate(
        candidate: Candidate
):

    score = calculate_score(
        candidate
    )

    candidate_data = candidate.dict()

    candidate_data["score"] = score
    candidate_data["status"] = "Shortlisted" if score >= 50 else "Rejected"

    candidate_collection.insert_one(
        candidate_data
    )

    return {

        "message":
        "Candidate Saved",

        "score":
        score

    }


@router.get(
    "/candidate/all"
)
def get_candidates():

    candidates = []

    for candidate in candidate_collection.find():

        candidate["_id"] = str(
            candidate["_id"]
        )

        candidate.setdefault(
            "score",
            0
        )

        candidates.append(
            candidate
        )

    return candidates


@router.get(
    "/candidate/rankings"
)
def get_rankings():

    candidates = []

    for candidate in candidate_collection.find():

        candidate["_id"] = str(
            candidate["_id"]
        )

        candidate.setdefault(
            "score",
            0
        )

        candidates.append(
            candidate
        )

    candidates.sort(

        key=lambda x:
        x["score"],

        reverse=True

    )

    return candidates


from bson import ObjectId

@router.delete("/candidate/delete/{candidate_id}")
def delete_candidate(candidate_id: str):
    try:
        res = candidate_collection.delete_one({"_id": ObjectId(candidate_id)})
        if res.deleted_count > 0:
            return {"message": "Candidate Deleted Successfully"}
        return {"message": "Candidate not found"}
    except Exception as e:
        return {"message": f"Error deleting candidate: {str(e)}"}