from routes.offer_routes import (
    router as offer_router
)
from routes.report_routes import (
    router as report_router
)
from routes.recruiter_ai_routes import (
    router as recruiter_ai_router
)
from routes.interview_routes import (
    router as interview_router
)
from routes.auth_routes import (
    router as auth_router
)
from routes.job_match_routes import (
    router as job_match_router
)
from routes.resume_routes import (
    router as resume_router
)
from routes.recruiter_routes import (
    router as recruiter_router
)

from routes.job_routes import (
    router as job_router
)
from routes.ai_routes import (
    router as ai_router
)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.candidate_routes import (
    router
)

app = FastAPI(
    title="AI Recruitment Platform"
)
app.add_middleware(

    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"]

)

app.include_router(router)


@app.get("/")
def home():

    return {

        "message":
        "AI Recruitment Platform Running"
    }
app.include_router(
    recruiter_router
)

app.include_router(
    job_router
)
app.include_router(ai_router)
app.include_router(
    resume_router
)
app.include_router(
    job_match_router
)
app.include_router(
    auth_router
)
app.include_router(
    interview_router
)
app.include_router(
    recruiter_ai_router
)
app.include_router(
    report_router
)
app.include_router(
    offer_router
)