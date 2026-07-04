import os
import json
import asyncio
import datetime
from fastapi import APIRouter, UploadFile, File, Form
from bson import ObjectId
from database.mongodb import candidate_collection, job_collection, db
from models.candidate import Candidate
from services.resume_parser import extract_resume_text
from services.gemini_extractor import extract_details_and_feedback
from services.scoring_engine import calculate_ats_breakdown
from services.skill_matcher import match_skills
from services.recommendation_engine import recommend_skills
from services.email_service import send_email_notification
from database.ats_database import SessionLocal, ATSReport

router = APIRouter()

@router.post("/resume/upload")
async def upload_resume(
    file: UploadFile = File(...),
    job_id: str = Form(None),
    username: str = Form(None)
):
    os.makedirs("uploads", exist_ok=True)
    file_path = f"uploads/{file.filename}"

    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)

    # 1. Extract Resume Text
    resume_text = await asyncio.to_thread(extract_resume_text, file_path)

    # 2. Extract Candidate Details using Gemini
    extracted = await extract_details_and_feedback(resume_text)

    # 3. Fetch Job to screen against
    required_skills = ["python", "sql", "machine learning", "fastapi", "docker", "aws"]
    target_job_title = "General Software Engineer (Default)"
    job_desc = "General software development role."
    min_ats = 50.0
    job_doc = None

    from services.scoring_engine import ROLE_SKILLS_MAPPING

    if job_id and job_id in ROLE_SKILLS_MAPPING:
        required_skills = ROLE_SKILLS_MAPPING[job_id]
        target_job_title = job_id
        job_desc = f"ATS screening evaluation for {job_id} role."
        min_ats = 50.0
        job_doc = {
            "title": target_job_title,
            "required_skills": required_skills,
            "preferred_skills": [],
            "description": job_desc,
            "minimum_experience": 1.0,
            "min_ats_score": min_ats
        }
    elif job_id and job_id != "undefined" and job_id != "":
        try:
            job_doc = await asyncio.to_thread(job_collection.find_one, {"_id": ObjectId(job_id)})
        except Exception as e:
            print("Error parsing job_id:", e)
    
    if not job_doc:
        try:
            job_doc = await asyncio.to_thread(job_collection.find_one, sort=[("_id", -1)])
        except Exception as e:
            print("Error fetching latest job:", e)

    if job_doc:
        required_skills = job_doc.get("required_skills", required_skills)
        target_job_title = job_doc.get("title", target_job_title)
        job_desc = job_doc.get("description", job_desc)
        min_ats = job_doc.get("min_ats_score", min_ats)
    else:
        job_doc = {
            "required_skills": required_skills,
            "title": target_job_title,
            "description": job_desc,
            "minimum_experience": 1.0
        }

    # 4. Perform Skill Gap Analysis & Recommendation
    candidate_skills = extracted.get("skills", [])
    match_result = match_skills(candidate_skills, required_skills)
    recommend_result = recommend_skills(candidate_skills, required_skills)

    # 5. Calculate Score Breakdown
    ats_data = calculate_ats_breakdown(
        candidate=None,  # Not needed since we pass extracted details directly
        job_doc=job_doc,
        resume_text=resume_text,
        extracted_details=extracted
    )

    score = ats_data["overall_score"]
    status = "Shortlisted" if score >= min_ats else "Rejected"

    # 6. Save to SQL Database (ats_reports table)
    sql_db = SessionLocal()
    try:
        report_row = ATSReport(
            candidate_name=extracted.get("name", "Unknown Candidate"),
            job_title=target_job_title,
            overall_score=score,
            skills_score=ats_data["skills_score"],
            experience_score=ats_data["experience_score"],
            education_score=ats_data["education_score"],
            projects_score=ats_data["projects_score"],
            formatting_score=ats_data["formatting_score"],
            keyword_score=ats_data["keyword_score"],
            missing_skills=json.dumps(ats_data["missing_skills"]),
            extra_skills="[]",
            strengths=json.dumps(ats_data["good_points"]),
            weaknesses=json.dumps(ats_data["weak_points"]),
            suggestions=json.dumps(ats_data["resume_suggestions"])
        )
        sql_db.add(report_row)
        sql_db.commit()
    except Exception as sql_err:
        print("SQL ATS report logging failed:", sql_err)
    finally:
        sql_db.close()

    # 7. Save to MongoDB
    candidate_doc = {
        "name": extracted.get("name", "Unknown Candidate"),
        "email": extracted.get("email", ""),
        "tenth_percentage": float(extracted.get("tenth_percentage", 0.0)),
        "twelfth_percentage": float(extracted.get("twelfth_percentage", 0.0)),
        "graduation_cgpa": float(extracted.get("graduation_cgpa", 0.0)),
        "experience_years": float(extracted.get("experience_years", 0.0)),
        "skills": candidate_skills,
        "projects": extracted.get("projects", []),
        "certificates": extracted.get("certificates", []),
        "achievements": extracted.get("achievements", []),
        "resume_text": resume_text,
        "feedback": extracted.get("feedback", ""),
        "score": score,
        "status": status,
        "skill_match": match_result.get("skill_match_percentage", 0.0),
        "matched_skills": match_result.get("matched_skills", []),
        "missing_skills": ats_data["missing_skills"],
        "recommendations": recommend_result.get("recommendations", []),
        "target_job_title": target_job_title,
        "username": username,
        
        # New Redesigned ATS Metrics
        "ats_breakdown": ats_data
    }

    inserted = await asyncio.to_thread(candidate_collection.insert_one, candidate_doc)
    candidate_doc["_id"] = str(inserted.inserted_id)

    # 8. Trigger Automated Recruiting Email Dispatches
    cand_email = extracted.get("email", "").strip()
    cand_name = extracted.get("name", "Candidate")
    if cand_email:
        try:
            send_email_notification("resume_received", cand_email, cand_name, {"job_title": target_job_title})
            if status == "Shortlisted":
                send_email_notification("shortlisted", cand_email, cand_name, {"job_title": target_job_title, "score": score})
            else:
                send_email_notification("rejected", cand_email, cand_name, {"job_title": target_job_title})
        except Exception as email_err:
            print("Auto-trigger emails failed:", email_err)

    # 9. Log Recruiter Notifications in MongoDB
    if username or cand_email:
        recipient_key = username if username else cand_email
        db["notifications"].insert_one({
            "recipient_email": recipient_key,
            "title": "Application Status Updated",
            "message": f"Your resume status for '{target_job_title}' has been evaluated as '{status}' (ATS Match: {score}%).",
            "type": "resume_status",
            "read": False,
            "created_at": datetime.datetime.utcnow().isoformat()
        })
        
    # Log Recruiter Activity
    db["activities"].insert_one({
        "type": "resume_process",
        "description": f"Processed resume screening for '{cand_name}' against job '{target_job_title}' (Score: {score}%).",
        "timestamp": datetime.datetime.utcnow().isoformat()
    })

    return candidate_doc

from typing import List

@router.post("/resume/rank-multiple")
async def rank_multiple_resumes(
    files: List[UploadFile] = File(...),
    job_id: str = Form(...),
    username: str = Form(None)
):
    import os
    import asyncio
    results = []
    
    # Fetch job to screen against
    required_skills = ["python", "sql", "machine learning", "fastapi", "docker", "aws"]
    target_job_title = job_id
    job_desc = f"ATS screening evaluation for {job_id} role."
    min_ats = 50.0
    job_doc = None
    
    from services.scoring_engine import ROLE_SKILLS_MAPPING
    
    if job_id in ROLE_SKILLS_MAPPING:
        required_skills = ROLE_SKILLS_MAPPING[job_id]
        job_doc = {
            "title": target_job_title,
            "required_skills": required_skills,
            "preferred_skills": [],
            "description": job_desc,
            "minimum_experience": 1.0,
            "min_ats_score": min_ats
        }
    else:
        try:
            job_doc = job_collection.find_one({"_id": ObjectId(job_id)})
        except Exception:
            pass
            
    if job_doc:
        required_skills = job_doc.get("required_skills", required_skills)
        target_job_title = job_doc.get("title", target_job_title)
        job_desc = job_doc.get("description", job_desc)
        min_ats = job_doc.get("min_ats_score", min_ats)
    else:
        job_doc = {
            "required_skills": required_skills,
            "title": target_job_title,
            "description": job_desc,
            "minimum_experience": 1.0
        }
        
    for file in files:
        os.makedirs("uploads", exist_ok=True)
        file_path = f"uploads/{file.filename}"
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
            
        # 1. Extract Resume Text
        resume_text = await asyncio.to_thread(extract_resume_text, file_path)
        
        # 2. Extract Details
        extracted = await extract_details_and_feedback(resume_text)
        
        # 3. Match Skills
        candidate_skills = extracted.get("skills", [])
        match_result = match_skills(candidate_skills, required_skills)
        recommend_result = recommend_skills(candidate_skills, required_skills)
        
        # 4. Score
        ats_data = calculate_ats_breakdown(
            candidate=None,
            job_doc=job_doc,
            resume_text=resume_text,
            extracted_details=extracted
        )
        score = ats_data["overall_score"]
        status = "Shortlisted" if score >= min_ats else "Rejected"
        
        # 5. Save to MongoDB
        candidate_doc = {
            "name": extracted.get("name", "Unknown Candidate"),
            "email": extracted.get("email", ""),
            "tenth_percentage": float(extracted.get("tenth_percentage", 0.0)),
            "twelfth_percentage": float(extracted.get("twelfth_percentage", 0.0)),
            "graduation_cgpa": float(extracted.get("graduation_cgpa", 0.0)),
            "experience_years": float(extracted.get("experience_years", 0.0)),
            "skills": candidate_skills,
            "projects": extracted.get("projects", []),
            "certificates": extracted.get("certificates", []),
            "achievements": extracted.get("achievements", []),
            "resume_text": resume_text,
            "feedback": extracted.get("feedback", ""),
            "score": score,
            "status": status,
            "skill_match": match_result.get("skill_match_percentage", 0.0),
            "matched_skills": match_result.get("matched_skills", []),
            "missing_skills": ats_data["missing_skills"],
            "recommendations": recommend_result.get("recommendations", []),
            "target_job_title": target_job_title,
            "username": username,
            "ats_breakdown": ats_data,
            "applied_at": datetime.datetime.utcnow().isoformat()
        }
        
        inserted = await asyncio.to_thread(candidate_collection.insert_one, candidate_doc)
        candidate_doc["_id"] = str(inserted.inserted_id)
        
        results.append({
            "name": candidate_doc["name"],
            "email": candidate_doc["email"],
            "score": score,
            "skills": candidate_skills,
            "experience_years": candidate_doc["experience_years"]
        })
        
    # Sort results by score in descending order
    results.sort(key=lambda x: x["score"], reverse=True)
    return results