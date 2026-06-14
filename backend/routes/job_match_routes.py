from fastapi import APIRouter

from services.job_matcher import (
    calculate_job_match
)

from services.recommendation_engine import (
    recommend_skills
)

router = APIRouter()
@router.post(
    "/job/skill-gap"
)
def skill_gap(
        data: dict
):

    candidate_skills = data[
        "candidate_skills"
    ]

    required_skills = data[
        "required_skills"
    ]

    match_result = calculate_job_match(

        candidate_skills,

        required_skills

    )

    recommendations = recommend_skills(

        candidate_skills,

        required_skills

    )

    return {

        "match_percentage":
        match_result[
            "match_percentage"
        ],

        "matched_skills":
        match_result[
            "matched_skills"
        ],

        "missing_skills":
        recommendations[
            "missing_skills"
        ],

        "recommendations":
        recommendations[
            "recommendations"
        ]
    }