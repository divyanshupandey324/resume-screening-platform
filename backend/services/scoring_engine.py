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
    # Deterministic scoring for candidate application payload
    if required_skills is None:
        required_skills = ROLE_SKILLS_MAPPING.get(job_title, ["python", "sql", "machine learning"])
    
    # 1. Skills Match (30%)
    matched_skills = len(set(required_skills) & set([s.lower().strip() for s in candidate.skills]))
    skills_ratio = matched_skills / len(required_skills) if required_skills else 1.0
    skills_part = min(30.0, skills_ratio * 30.0)

    # 2. Experience (20%)
    exp_years = float(candidate.experience_years)
    exp_part = min(20.0, (exp_years / 2.0) * 20.0)

    # 3. Projects (15%)
    num_projects = len(candidate.projects)
    if num_projects >= 3:
        proj_part = 15.0
    elif num_projects == 2:
        proj_part = 10.0
    elif num_projects == 1:
        proj_part = 5.0
    else:
        proj_part = 0.0

    # 4. Education (15%)
    grad = float(candidate.graduation_cgpa or 0.0)
    tenth = float(candidate.tenth_percentage or 0.0)
    twelfth = float(candidate.twelfth_percentage or 0.0)
    edu_part = min(15.0, ((grad / 10.0) * 9.0) + ((tenth / 100.0) * 3.0) + ((twelfth / 100.0) * 3.0))

    # 5. Certificates (10%)
    num_certs = len(candidate.certificates or [])
    if num_certs >= 2:
        cert_part = 10.0
    elif num_certs == 1:
        cert_part = 6.0
    else:
        cert_part = 0.0

    # 6. Completeness (10%)
    comp_points = 0.0
    if candidate.name and candidate.name != "Unknown Candidate":
        comp_points += 2.0
    if candidate.email:
        comp_points += 2.0
    if candidate.skills:
        comp_points += 2.0
    if exp_years > 0:
        comp_points += 2.0
    if num_projects > 0 or num_certs > 0:
        comp_points += 2.0
    completeness_part = comp_points
    
    overall = skills_part + exp_part + proj_part + edu_part + cert_part + completeness_part
    return round(min(100.0, max(0.0, overall)), 2)

def calculate_ats_breakdown(candidate, job_doc, resume_text, extracted_details) -> dict:
    required_skills = [s.lower().strip() for s in job_doc.get("required_skills", [])]
    preferred_skills = [s.lower().strip() for s in job_doc.get("preferred_skills", [])]
    candidate_skills = [s.lower().strip() for s in extracted_details.get("skills", [])]
    
    deductions = []

    # 1. Skills Match (25%)
    matched_req = list(set(required_skills) & set(candidate_skills))
    missing_skills = list(set(required_skills) - set(candidate_skills))
    
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
    if cand_exp >= min_exp:
        experience_score = 15.0
    else:
        experience_score = round(15.0 * (cand_exp / min_exp), 2)
        
    if experience_score < 15.0:
        deductions.append({
            "metric": "Experience",
            "points": round(15.0 - experience_score, 2),
            "reason": f"Candidate experience ({cand_exp} Yrs) is below target minimum ({min_exp} Yrs)."
        })

    # 3. Projects (10%)
    num_projects = len(extracted_details.get("projects", []))
    if num_projects >= 3:
        projects_score = 10.0
    elif num_projects == 2:
        projects_score = 7.0
    elif num_projects == 1:
        projects_score = 4.0
    else:
        projects_score = 0.0
        
    if projects_score < 10.0:
        deductions.append({
            "metric": "Projects",
            "points": round(10.0 - projects_score, 2),
            "reason": f"Only {num_projects} project(s) listed. We recommend listing at least 3 distinct projects."
        })

    # 4. Education (10%)
    grad_cgpa = float(extracted_details.get("graduation_cgpa", 0.0))
    tenth_pct = float(extracted_details.get("tenth_percentage", 0.0))
    twelfth_pct = float(extracted_details.get("twelfth_percentage", 0.0))
    
    grad_score = round((grad_cgpa / 10.0) * 6.0, 2)
    twelfth_score = round((twelfth_pct / 100.0) * 2.0, 2)
    tenth_score = round((tenth_pct / 100.0) * 2.0, 2)
    
    education_score = round(min(10.0, grad_score + twelfth_score + tenth_score), 2)
    
    if education_score < 10.0:
        edu_reasons = []
        if grad_cgpa == 0.0:
            edu_reasons.append("Graduation CGPA is not specified in the resume")
        elif grad_cgpa < 8.0:
            edu_reasons.append(f"Graduation CGPA ({grad_cgpa}) is below the recommended 8.0")
            
        if tenth_pct == 0.0:
            edu_reasons.append("10th class percentage is not specified in the resume")
        elif tenth_pct < 80.0:
            edu_reasons.append(f"10th marks ({tenth_pct}%) are below the recommended 80%")
            
        if twelfth_pct == 0.0:
            edu_reasons.append("12th class percentage is not specified in the resume")
        elif twelfth_pct < 80.0:
            edu_reasons.append(f"12th marks ({twelfth_pct}%) are below the recommended 80%")
        
        deductions.append({
            "metric": "Education",
            "points": round(10.0 - education_score, 2),
            "reason": ", ".join(edu_reasons) if edu_reasons else "Academic score metrics are below optimal levels."
        })

    # 5. Certificates (5%)
    num_certs = len(extracted_details.get("certificates", []))
    if num_certs >= 2:
        certifications_score = 5.0
    elif num_certs == 1:
        certifications_score = 3.0
    else:
        certifications_score = 0.0
        
    if certifications_score < 5.0:
        deductions.append({
            "metric": "Certificates",
            "points": round(5.0 - certifications_score, 2),
            "reason": f"Only {num_certs} certificate(s) listed (minimum 2 recommended)."
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
    if extracted_details.get("name") and extracted_details["name"] != "Unknown Candidate":
        comp_points += 1.0
    if extracted_details.get("email"):
        comp_points += 1.0
    if extracted_details.get("skills"):
        comp_points += 1.0
    if extracted_details.get("experience_years", 0.0) > 0.0:
        comp_points += 1.0
    if num_projects > 0 or len(extracted_details.get("certificates", [])) > 0:
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
    if len(matched_req) > 0:
        good_points.append(f"Successfully matched {len(matched_req)} required skill(s) for the target role.")
    if cand_exp >= min_exp:
        good_points.append(f"Meets or exceeds the target minimum experience of {min_exp} year(s).")
    if grad_cgpa >= 8.0:
        good_points.append("Strong academic record (Graduation CGPA above 8.0/10).")

    weak_points = extracted_details.get("weaknesses", [])
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