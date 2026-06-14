from fastapi import APIRouter

from models.recruiter import Recruiter

from database.mongodb import (
    recruiter_collection
)

router = APIRouter()


@router.post(
    "/recruiter/save"
)
def save_recruiter(
        recruiter: Recruiter
):

    recruiter_collection.insert_one(
        recruiter.dict()
    )

    return {

        "message":
        "Recruiter Saved"
    }


@router.get(
    "/recruiter/all"
)
def get_recruiters():

    recruiters = []

    for recruiter in recruiter_collection.find():

        recruiter["_id"] = str(
            recruiter["_id"]
        )

        recruiters.append(
            recruiter
        )

    return recruiters