from fastapi import APIRouter

from services.offer_letter import (
    generate_offer_letter
)

router = APIRouter()


@router.post(
    "/offer/generate"
)
def offer(
        data: dict
):

    result = generate_offer_letter(

        data["candidate_name"],

        data["company_name"]

    )

    return {

        "offer_letter":
        result
    }