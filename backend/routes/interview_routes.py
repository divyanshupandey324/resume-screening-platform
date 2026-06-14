from fastapi import APIRouter

from services.interview_simulator import (
    generate_interview_feedback
)

router = APIRouter()


@router.post(
    "/interview/evaluate"
)
def evaluate_answer(
        data: dict
):

    result = generate_interview_feedback(

        data["answer"]

    )

    return result