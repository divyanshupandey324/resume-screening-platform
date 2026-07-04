from database.mongodb import (
    candidate_collection,
    job_collection,
    db
)
import datetime
from bson import ObjectId
from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, Form, File, UploadFile

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
def get_candidates(skip: int = 0, limit: int = 100):

    candidates = []

    for candidate in candidate_collection.find().skip(skip).limit(limit):

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
def get_rankings(skip: int = 0, limit: int = 100):

    candidates = []

    for candidate in candidate_collection.find().skip(skip).limit(limit):

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

class ApplyPayload(BaseModel):
    job_id: str
    username: str
    name: str
    email: str
    skills: List[str]
    experience_years: float
    projects: Optional[List[str]] = []

@router.post("/candidate/apply")
async def apply_job(
    job_id: str = Form(...),
    username: str = Form(...),
    name: str = Form(...),
    email: str = Form(...),
    skills: str = Form(...),
    experience_years: float = Form(...),
    projects: str = Form(""),
    phone: str = Form(""),
    file: UploadFile = File(None)
):
    import os
    import asyncio
    # 1. Validate fields
    if not name.strip():
        raise HTTPException(status_code=400, detail="Full Name is required")
    if not email.strip():
        raise HTTPException(status_code=400, detail="Email is required")
    if "@" not in email:
        raise HTTPException(status_code=400, detail="Invalid Email Address format")
    
    skills_list = [s.strip().lower() for s in skills.split(",") if s.strip()]
    if not skills_list:
        raise HTTPException(status_code=400, detail="Skills are required")
    if experience_years < 0:
        raise HTTPException(status_code=400, detail="Experience years cannot be negative")

    projects_list = [p.strip() for p in projects.split(",") if p.strip()]

    # 2. Prevent duplicate applications
    existing = candidate_collection.find_one({
        "username": username,
        "job_id": job_id
    })
    if existing:
        raise HTTPException(status_code=400, detail="You have already applied for this job.")

    # 3. Fetch Job to screen against
    try:
        job_doc = job_collection.find_one({"_id": ObjectId(job_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Job ID format")

    if not job_doc:
        raise HTTPException(status_code=400, detail="Job position not found")

    target_job_title = job_doc.get("title", "General Software Engineer")
    recruiter_id = job_doc.get("recruiter_id", "recruiter_default")

    # 4. Handle uploaded resume file
    resume_text = ""
    resume_id = None
    if file:
        os.makedirs("uploads", exist_ok=True)
        file_path = f"uploads/{file.filename}"
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        from services.resume_parser import extract_resume_text
        resume_text = await asyncio.to_thread(extract_resume_text, file_path)
    else:
        # Fallback to check if they have a previously uploaded resume
        resume_doc = candidate_collection.find_one({
            "username": username,
            "resume_text": {"$exists": True, "$ne": ""}
        }, sort=[("_id", -1)])
        if resume_doc:
            resume_text = resume_doc.get("resume_text", "")
            resume_id = str(resume_doc["_id"])
        else:
            resume_text = f"Candidate Name: {name}\nSkills: {skills}\nExperience: {experience_years} years\nProjects: {projects}"

    # 5. Calculate Weighted ATS Score Breakdown
    from services.scoring_engine import calculate_ats_breakdown
    
    extracted_details = {
        "name": name,
        "email": email,
        "skills": skills_list,
        "experience_years": experience_years,
        "projects": [{"title": p, "description": "Form Application project"} for p in projects_list],
        "tenth_percentage": 85.0,
        "twelfth_percentage": 85.0,
        "graduation_cgpa": 8.5,
        "certificates": [],
        "formatting_score": 90.0,
        "grammar_score": 90.0,
        "strengths": ["Clear profile details provided"],
        "weaknesses": []
    }

    ats_data = calculate_ats_breakdown(
        candidate=None,
        job_doc=job_doc,
        resume_text=resume_text,
        extracted_details=extracted_details
    )

    score = ats_data["overall_score"]

    # 6. Save Application directly in candidate_collection
    candidate_doc = {
        "candidate_id": username,
        "name": name,
        "email": email,
        "phone": phone, # Contact Number
        "tenth_percentage": 85.0,
        "twelfth_percentage": 85.0,
        "graduation_cgpa": 8.5,
        "experience_years": experience_years,
        "skills": skills_list,
        "projects": projects_list,
        "certificates": [],
        "achievements": [],
        "resume_text": resume_text,
        "feedback": ats_data.get("resume_suggestions", "Profile screening complete."),
        "score": score,
        "status": "Applied",
        "target_job_title": target_job_title,
        "username": username,
        "job_id": job_id,
        "recruiter_id": recruiter_id,
        "resume_id": resume_id,
        "applied_at": datetime.datetime.utcnow().isoformat(),
        "ats_breakdown": ats_data
    }

    inserted = candidate_collection.insert_one(candidate_doc)
    candidate_doc["_id"] = str(inserted.inserted_id)

    # 7. Send "Application Submitted" Email Confirmation & Notifications
    from services.email_service import send_email_notification
    try:
        send_email_notification("resume_received", email, name, {"job_title": target_job_title})
    except Exception as email_err:
        print("Failed to send application confirmation email:", email_err)

    db["notifications"].insert_one({
        "recipient_email": username,
        "title": "Application Submitted",
        "message": f"You have successfully applied for the '{target_job_title}' role.",
        "type": "application_status",
        "read": False,
        "created_at": datetime.datetime.utcnow().isoformat()
    })

    db["activities"].insert_one({
        "type": "job_apply",
        "description": f"Candidate {name} applied for '{target_job_title}'.",
        "timestamp": datetime.datetime.utcnow().isoformat()
    })

    return {
        "success": True,
        "message": "✓ Application submitted successfully!",
        "candidate": candidate_doc
    }

@router.get("/candidate/notifications")
def get_candidate_notifications(username: str):
    notifs = []
    for n in db["notifications"].find({"recipient_email": username}).sort("created_at", -1).limit(50):
        n["_id"] = str(n["_id"])
        notifs.append(n)
    return notifs

@router.post("/candidate/notifications/read/{id}")
def mark_notification_read(id: str):
    try:
        db["notifications"].update_one(
            {"_id": ObjectId(id)},
            {"$set": {"read": True}}
        )
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid notification ID: {e}")