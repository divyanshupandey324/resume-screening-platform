import re
import json
import logging

WORD_RE = re.compile(r'\b[a-z]{3,}\b')

logger = logging.getLogger("ScoringEngine")

ROLE_SKILLS_MAPPING = {
    "Software Engineer": ["java", "python", "javascript", "dsa", "git", "sql"],
    "Java Developer": ["java", "spring boot", "hibernate", "maven", "sql", "git"],
    "Python Developer": ["python", "django", "flask", "sql", "git", "apis"],
    "Full Stack Developer": ["javascript", "react", "node.js", "express", "mongodb", "sql", "git", "html", "css"],
    "Frontend Developer": ["javascript", "react", "html5", "css3", "git", "tailwind", "typescript"],
    "Backend Developer": ["node.js", "python", "java", "sql", "mongodb", "express", "git", "apis"],
    "React Developer": ["react", "javascript", "redux", "html5", "css3", "git", "typescript"],
    "Angular Developer": ["angular", "typescript", "javascript", "rxjs", "html5", "css3", "git"],
    "Node.js Developer": ["node.js", "javascript", "express", "mongodb", "git", "apis"],
    "AI Engineer": ["python", "machine learning", "deep learning", "pytorch", "tensorflow", "nlp", "transformers", "llms"],
    "Machine Learning Engineer": ["python", "machine learning", "scikit-learn", "pandas", "numpy", "tensorflow", "pytorch"],
    "Deep Learning Engineer": ["python", "deep learning", "tensorflow", "pytorch", "keras", "neural networks", "computer vision"],
    "Data Scientist": ["python", "r", "machine learning", "sql", "pandas", "numpy", "data analysis", "statistics"],
    "Data Analyst": ["sql", "excel", "python", "tableau", "power bi", "data analysis", "pandas"],
    "Data Engineer": ["python", "sql", "spark", "hadoop", "etl", "data pipelines", "aws"],
    "Cloud Engineer": ["aws", "azure", "gcp", "terraform", "docker", "kubernetes", "linux"],
    "AWS Engineer": ["aws", "iam", "s3", "ec2", "rds", "lambda", "cloudformation"],
    "Azure Engineer": ["azure", "active directory", "virtual machines", "aks", "blob storage", "arm templates"],
    "DevOps Engineer": ["docker", "kubernetes", "jenkins", "ci/cd", "terraform", "ansible", "linux", "aws"],
    "Cyber Security Engineer": ["security", "networking", "firewalls", "penetration testing", "cryptography", "wireshark"],
    "Blockchain Developer": ["solidity", "ethereum", "blockchain", "smart contracts", "web3.js", "cryptography"],
    "Android Developer": ["kotlin", "java", "android sdk", "xml", "retrofits", "git"],
    "Flutter Developer": ["dart", "flutter", "state management", "apis", "git", "mobile development"],
    "UI/UX Designer": ["figma", "sketch", "adobe xd", "wireframing", "prototyping", "user research", "ui design"],
    "QA Engineer": ["manual testing", "selenium", "java", "jira", "test automation", "qa"],
    "Automation Tester": ["selenium", "playwright", "cypress", "java", "python", "test automation", "ci/cd"],
    "Embedded Systems Engineer": ["c", "cpp", "microcontrollers", "rtos", "embedded systems", "firmware", "iot"],
    "Network Engineer": ["cisco", "routing", "switching", "tcp/ip", "firewalls", "vpn", "dns"],
    "Database Administrator": ["sql", "oracle", "mysql", "postgresql", "database administration", "backup", "tuning"],
    "Product Manager": ["agile", "scrum", "product roadmap", "jira", "product management", "market research"],
    "Business Analyst": ["business analysis", "requirements gathering", "jira", "sql", "excel", "uml"],
    "System Administrator": ["linux", "windows server", "active directory", "bash scripting", "networking", "virtualization"]
}

def calculate_score(candidate, job_title="General Software Engineer", required_skills=None, job_description="General software development role.") -> float:
    # Adapt Pydantic Candidate model or dict to extracted_details structure
    extracted_details = {
        "name": getattr(candidate, "name", "Unknown Candidate"),
        "email": getattr(candidate, "email", ""),
        "phone": getattr(candidate, "phone", "Not Found"),
        "tenth_percentage": getattr(candidate, "tenth_percentage", 0.0),
        "twelfth_percentage": getattr(candidate, "twelfth_percentage", 0.0),
        "graduation_cgpa": getattr(candidate, "graduation_cgpa", 0.0),
        "experience_years": getattr(candidate, "experience_years", 0.0),
        "skills": getattr(candidate, "skills", []),
        "projects": getattr(candidate, "projects", []),
        "certificates": getattr(candidate, "certificates", []),
        "achievements": getattr(candidate, "achievements", []),
        "education_quality_score": 80.0 if getattr(candidate, "graduation_cgpa", 0.0) > 0 else 50.0,
        "experience_relevance_score": 80.0 if getattr(candidate, "experience_years", 0.0) > 0 else 50.0,
        "projects_quality_score": 80.0 if getattr(candidate, "projects", []) else 50.0,
        "certifications_relevance_score": 80.0 if getattr(candidate, "certificates", []) else 50.0,
        "grammar_score": 90.0,
        "formatting_score": 90.0
    }
    
    job_doc = {
        "title": job_title,
        "required_skills": required_skills if required_skills is not None else ROLE_SKILLS_MAPPING.get(job_title, ["python", "sql", "machine learning"]),
        "description": job_description,
        "minimum_experience": 1.0
    }
    
    breakdown = calculate_ats_breakdown(
        candidate=None,
        job_doc=job_doc,
        resume_text=f"Skills: {', '.join(extracted_details['skills'])} Projects: {', '.join(extracted_details['projects'])}",
        extracted_details=extracted_details
    )
    return breakdown["overall_score"]

def calculate_ats_breakdown(candidate, job_doc, resume_text, extracted_details) -> dict:
    required_skills = [s.lower().strip() for s in job_doc.get("required_skills", [])]
    candidate_skills = [s.lower().strip() for s in extracted_details.get("skills", [])]
    
    deductions = []

    # 1. Skills Match (25%)
    # Support robust substring and case-insensitive matching
    matched_req = []
    for req in required_skills:
        for cand in candidate_skills:
            if req in cand or cand in req:
                matched_req.append(req)
                break
    matched_req = list(set(matched_req))
    missing_skills = list(set(required_skills) - set(matched_req))
    
    if required_skills:
        skills_score = round(25.0 * (len(matched_req) / len(required_skills)), 2)
    else:
        skills_score = 25.0
        
    if skills_score < 25.0:
        deductions.append({
            "metric": "Skills Match",
            "points": round(25.0 - skills_score, 2),
            "reason": f"Missing required skills: {', '.join(missing_skills)}" if missing_skills else "Missing target required skills."
        })

    # 2. Experience (15%)
    min_exp = float(job_doc.get("minimum_experience") or 1.0)
    if min_exp <= 0:
        min_exp = 1.0
    cand_exp = float(extracted_details.get("experience_years", 0.0))
    exp_ratio = min(1.0, cand_exp / min_exp)
    
    # Combine quantitative experience years with qualitative relevance score from LLM
    exp_relevance = float(extracted_details.get("experience_relevance_score", 70.0))
    weighted_exp_score = (exp_relevance * 0.6) + (exp_ratio * 100.0 * 0.4)
    experience_score = round((weighted_exp_score / 100.0) * 15.0, 2)
        
    if experience_score < 15.0:
        deductions.append({
            "metric": "Experience",
            "points": round(15.0 - experience_score, 2),
            "reason": f"Candidate experience ({cand_exp} Yrs) is below target minimum ({min_exp} Yrs) or lacks relevant work history alignment."
        })

    # 3. Projects (10%)
    projects_quality = float(extracted_details.get("projects_quality_score", 70.0))
    projects_score = round((projects_quality / 100.0) * 10.0, 2)
        
    if projects_score < 10.0:
        deductions.append({
            "metric": "Projects",
            "points": round(10.0 - projects_score, 2),
            "reason": "Technical depth, impact, or documentation of candidate projects can be improved."
        })

    # 4. Education (10%)
    # Combine grades/CGPA with degree/institution quality score from LLM
    grad_cgpa = float(extracted_details.get("graduation_cgpa", 0.0))
    cgpa_ratio = min(1.0, grad_cgpa / 10.0) if grad_cgpa > 0 else 0.5
    edu_quality = float(extracted_details.get("education_quality_score", 70.0))
    weighted_edu_score = (edu_quality * 0.7) + (cgpa_ratio * 100.0 * 0.3)
    education_score = round((weighted_edu_score / 100.0) * 10.0, 2)
    
    if education_score < 10.0:
        deductions.append({
            "metric": "Education",
            "points": round(10.0 - education_score, 2),
            "reason": f"Academic credentials or field of study relevance score is evaluated as {edu_quality}%."
        })

    # 5. Certificates (5%)
    cert_relevance = float(extracted_details.get("certifications_relevance_score", 70.0))
    certifications_score = round((cert_relevance / 100.0) * 5.0, 2)
        
    if certifications_score < 5.0:
        deductions.append({
            "metric": "Certificates",
            "points": round(5.0 - certifications_score, 2),
            "reason": "Relevance or count of certifications is below optimal level for target role."
        })

    # 6. Resume Structure (5%)
    missing_sections = extracted_details.get("missing_sections", [])
    resume_structure_score = round(max(0.0, 5.0 - len(missing_sections) * 1.0), 2)
    
    if resume_structure_score < 5.0:
        deductions.append({
            "metric": "Resume Structure",
            "points": round(5.0 - resume_structure_score, 2),
            "reason": f"Missing key resume sections: {', '.join(missing_sections)}."
        })

    # 7. Keywords (10%)
    job_desc = job_doc.get("description", "").lower()
    job_words = set(WORD_RE.findall(job_desc))
    resume_words = set(WORD_RE.findall(resume_text.lower()))
    
    overlap = len(job_words & resume_words)
    if job_words:
        keyword_score = round((overlap / len(job_words)) * 10.0, 2)
    else:
        keyword_score = 10.0
    keyword_score = round(min(10.0, keyword_score), 2)
    
    if keyword_score < 10.0:
        overlap_pct = (overlap / len(job_words) * 100) if job_words else 100
        deductions.append({
            "metric": "Keywords Match",
            "points": round(10.0 - keyword_score, 2),
            "reason": f"Keyword match density is {overlap_pct:.1f}% (target: 100%)."
        })

    # 8. Grammar (10%)
    raw_gram_score = float(extracted_details.get("grammar_score", 90.0))
    grammar_score = round((raw_gram_score / 100.0) * 10.0, 2)
    
    if grammar_score < 10.0:
        gram_sugs = extracted_details.get("grammar_suggestions", [])
        deductions.append({
            "metric": "Grammar & Spelling",
            "points": round(10.0 - grammar_score, 2),
            "reason": f"Linguistic quality is {raw_gram_score}%: {gram_sugs[0] if gram_sugs else 'Spelling errors.'}"
        })

    # 9. Formatting (5%)
    raw_fmt_score = float(extracted_details.get("formatting_score", 90.0))
    formatting_score = round((raw_fmt_score / 100.0) * 5.0, 2)
    
    if formatting_score < 5.0:
        fmt_issues = extracted_details.get("formatting_issues", [])
        deductions.append({
            "metric": "Formatting",
            "points": round(5.0 - formatting_score, 2),
            "reason": f"Layout score is {raw_fmt_score}%: {fmt_issues[0] if fmt_issues else 'Layout alignment issues.'}"
        })

    # 10. Completeness (5%)
    comp_points = 0.0
    # Programmatic verification of key content fields
    if extracted_details.get("name") and extracted_details["name"] not in ["Unknown Candidate", "Not Found"]:
        comp_points += 1.0
    if extracted_details.get("email") and extracted_details["email"] not in ["", "Not Found"]:
        comp_points += 1.0
    if extracted_details.get("phone") and extracted_details["phone"] not in ["", "Not Found"]:
        comp_points += 1.0
    if candidate_skills:
        comp_points += 1.0
    if extracted_details.get("experience", []) or extracted_details.get("projects", []):
        comp_points += 1.0
    completeness_score = round(comp_points, 2)
    
    if completeness_score < 5.0:
        deductions.append({
            "metric": "Completeness",
            "points": round(5.0 - completeness_score, 2),
            "reason": "Missing essential profile details (contact info, skills, or projects)."
        })

    # Overall Score Sum
    overall_score = round(
        skills_score + 
        experience_score + 
        education_score + 
        projects_score + 
        certifications_score + 
        resume_structure_score +
        formatting_score + 
        completeness_score + 
        keyword_score + 
        grammar_score, 
        2
    )
    overall_score = min(100.0, max(0.0, overall_score))

    # Build detailed lists for pros, cons, and recommendations
    good_points = extracted_details.get("strengths", [])
    if not isinstance(good_points, list):
        good_points = [good_points] if good_points else []
    if len(matched_req) > 0:
        good_points.append(f"Successfully matched {len(matched_req)} required skill(s) for the target role.")
    if cand_exp >= min_exp:
        good_points.append(f"Meets or exceeds the target minimum experience of {min_exp} year(s).")
    if grad_cgpa >= 8.0:
        good_points.append("Strong academic record (Graduation CGPA above 8.0/10).")

    weak_points = extracted_details.get("weaknesses", [])
    if not isinstance(weak_points, list):
        weak_points = [weak_points] if weak_points else []
    if missing_skills:
        weak_points.append(f"Missing key required skills: {', '.join(missing_skills)}")
    if cand_exp < min_exp:
        weak_points.append(f"Experience ({cand_exp} yrs) is below the recommended {min_exp} year(s).")

    return {
        "overall_score": overall_score,
        "skills_score": skills_score,
        "experience_score": experience_score,
        "education_score": education_score,
        "projects_score": projects_score,
        "certifications_score": certifications_score,
        "resume_structure_score": resume_structure_score,
        "formatting_score": formatting_score,
        "completeness_score": completeness_score,
        "keyword_score": keyword_score,
        "grammar_score": grammar_score,
        "good_points": good_points,
        "weak_points": weak_points,
        "missing_skills": missing_skills,
        "formatting_issues": extracted_details.get("formatting_issues", []),
        "resume_suggestions": extracted_details.get("resume_suggestions", []),
        "keyword_suggestions": extracted_details.get("keyword_suggestions", []),
        "grammar_suggestions": extracted_details.get("grammar_suggestions", []),
        "missing_sections": extracted_details.get("missing_sections", []),
        "ai_probability": extracted_details.get("ai_probability", 15.0),
        "ai_result": extracted_details.get("ai_result", "Likely Human Written"),
        "ai_explanation": extracted_details.get("ai_explanation", "Natural language structures check out."),
        "deductions": deductions
    }