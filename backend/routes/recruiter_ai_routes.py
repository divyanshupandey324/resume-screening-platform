from fastapi import APIRouter

from services.recruiter_assistant import (
    recruiter_help
)

router = APIRouter()


@router.post(
    "/recruiter/assistant"
)
def assistant(
        data: dict
):

    response = recruiter_help(

        data["query"]

    )

    return {

        "response":
        response
    }