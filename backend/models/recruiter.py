from pydantic import BaseModel


class Recruiter(
    BaseModel
):

    company_name: str

    recruiter_name: str

    email: str