from fastapi import APIRouter

from services.ai_resume_feedback import (
    get_resume_feedback
)

from services.ai_candidate_analyzer import (
    analyze_candidate
)

router = APIRouter()
@router.post(
    "/ai/resume-feedback"
)
def resume_feedback(
        data: dict
):

    result = get_resume_feedback(

        data["resume_text"]

    )

    return {

        "feedback":
        result
    }
@router.post(
    "/ai/candidate-analysis"
)
def candidate_analysis(
        data: dict
):

    result = analyze_candidate(
        data
    )

    return {

        "analysis":
        result
    }