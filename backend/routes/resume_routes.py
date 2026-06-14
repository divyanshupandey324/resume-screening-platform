import os
from fastapi import APIRouter, UploadFile, File, Form
from bson import ObjectId
from database.mongodb import candidate_collection, job_collection
from models.candidate import Candidate
from services.resume_parser import extract_resume_text
from services.gemini_extractor import extract_details_and_feedback
from services.scoring_engine import calculate_score
from services.skill_matcher import match_skills
from services.recommendation_engine import recommend_skills

router = APIRouter()


@router.post("/resume/upload")
async def upload_resume(
    file: UploadFile = File(...),
    job_id: str = Form(None)
):
    os.makedirs("uploads", exist_ok=True)
    file_path = f"uploads/{file.filename}"

    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)

    # 1. Extract Resume Text
    resume_text = extract_resume_text(file_path)

    # 2. Extract Candidate Details & AI Feedback using Gemini
    extracted = extract_details_and_feedback(resume_text)

    # 3. Fetch Job to screen against for Skill Match
    required_skills = ["python", "sql", "machine learning", "fastapi", "docker", "aws"]
    target_job_title = "General Software Engineer (Default)"

    if job_id and job_id != "undefined" and job_id != "":
        try:
            job = job_collection.find_one({"_id": ObjectId(job_id)})
            if job:
                required_skills = job.get("required_skills", required_skills)
                target_job_title = job.get("title", target_job_title)
        except Exception as e:
            print("Error parsing job_id:", e)
    else:
        # Fallback to the latest job in database if any exists
        try:
            latest_job = job_collection.find_one(sort=[("_id", -1)])
            if latest_job:
                required_skills = latest_job.get("required_skills", required_skills)
                target_job_title = latest_job.get("title", target_job_title)
        except Exception as e:
            print("Error fetching latest job:", e)

    # 4. Perform Skill Gap Analysis
    candidate_skills = extracted.get("skills", [])
    match_result = match_skills(candidate_skills, required_skills)
    recommend_result = recommend_skills(candidate_skills, required_skills)

    # 5. Convert to Candidate Pydantic Model and Calculate Score
    candidate_obj = Candidate(
        name=extracted.get("name", "Unknown Candidate"),
        email=extracted.get("email", ""),
        tenth_percentage=float(extracted.get("tenth_percentage", 0.0)),
        twelfth_percentage=float(extracted.get("twelfth_percentage", 0.0)),
        graduation_cgpa=float(extracted.get("graduation_cgpa", 0.0)),
        experience_years=float(extracted.get("experience_years", 0.0)),
        skills=candidate_skills,
        projects=extracted.get("projects", []),
        certificates=extracted.get("certificates", []),
        achievements=extracted.get("achievements", [])
    )

    score = calculate_score(candidate_obj)

    # 6. Status Assignment
    status = "Shortlisted" if score >= 50 else "Rejected"

    # 7. Save to MongoDB
    candidate_doc = {
        "name": candidate_obj.name,
        "email": candidate_obj.email,
        "tenth_percentage": candidate_obj.tenth_percentage,
        "twelfth_percentage": candidate_obj.twelfth_percentage,
        "graduation_cgpa": candidate_obj.graduation_cgpa,
        "experience_years": candidate_obj.experience_years,
        "skills": candidate_obj.skills,
        "projects": candidate_obj.projects,
        "certificates": candidate_obj.certificates,
        "achievements": candidate_obj.achievements,
        "resume_text": resume_text,
        "feedback": extracted.get("feedback", ""),
        "score": score,
        "status": status,
        "skill_match": match_result.get("skill_match_percentage", 0.0),
        "matched_skills": match_result.get("matched_skills", []),
        "missing_skills": match_result.get("missing_skills", []),
        "recommendations": recommend_result.get("recommendations", []),
        "target_job_title": target_job_title
    }

    inserted = candidate_collection.insert_one(candidate_doc)
    candidate_doc["_id"] = str(inserted.inserted_id)

    return candidate_doc