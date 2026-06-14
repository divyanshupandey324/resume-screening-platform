from fastapi import APIRouter

from services.pdf_generator import (
    generate_report
)

router = APIRouter()


@router.post(
    "/report/generate"
)
def report(
        data: dict
):

    filename = generate_report(

        data["name"],

        data["score"]

    )

    return {

        "pdf":
        filename
    }