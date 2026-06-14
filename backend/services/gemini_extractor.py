import json
import re
from services.gemini_service import model

async def extract_details_and_feedback(resume_text: str) -> dict:
    prompt = f"""
    You are an expert AI recruiter. Analyze the following resume text and extract candidate details as a structured JSON object.
    
    Fields to extract:
    - name: Full name (string). If not found, use "Unknown Candidate".
    - email: Email address (string). If not found, use "".
    - tenth_percentage: 10th class percentage/score (float, 0.0 to 100.0, default 0.0).
    - twelfth_percentage: 12th class percentage/score (float, 0.0 to 100.0, default 0.0).
    - graduation_cgpa: Graduation CGPA (float, 0.0 to 10.0, default 0.0). If they have a percentage like 80%, convert it to CGPA by dividing by 10 (e.g. 8.0).
    - experience_years: Total years of work/professional experience as a float/number. Look for job durations. If none, return 0.0.
    - skills: List of programming languages, frameworks, developer tools, database engines, etc. (list of strings).
    - projects: List of names or descriptions of projects mentioned (list of strings).
    - certificates: List of certifications (list of strings).
    - achievements: List of accomplishments, hackathons, academic awards (list of strings).
    - feedback: A paragraph summarizing:
      1. Strengths: What the candidate did well and their core competencies.
      2. Weaknesses: Any missing key skills or experience areas.
      3. Suggestions: Direct recommendations to improve their resume.
      Provide this feedback as a formatted string with bullet points.

    Provide ONLY valid JSON. Return the raw JSON block. Do not wrap the JSON output in markdown tags (no ```json).

    Resume Text:
    {resume_text}
    """

    try:
        response = await model.generate_content_async(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        text = response.text.strip()
        
        # Clean any markdown wrapping
        if text.startswith("```"):
            # remove ```json or ```
            text = re.sub(r"^```(json)?", "", text)
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()
        
        data = json.loads(text)
        
        # Ensure default keys
        data.setdefault("name", "Unknown Candidate")
        data.setdefault("email", "")
        data.setdefault("tenth_percentage", 0.0)
        data.setdefault("twelfth_percentage", 0.0)
        data.setdefault("graduation_cgpa", 0.0)
        data.setdefault("experience_years", 0.0)
        data.setdefault("skills", [])
        data.setdefault("projects", [])
        data.setdefault("certificates", [])
        data.setdefault("achievements", [])
        data.setdefault("feedback", "No feedback available.")
        
        return data
    except Exception as e:
        print("Error parsing Gemini JSON output:", e)
        # Return empty structured defaults
        return {
            "name": "Unknown Candidate",
            "email": "",
            "tenth_percentage": 0.0,
            "twelfth_percentage": 0.0,
            "graduation_cgpa": 0.0,
            "experience_years": 0.0,
            "skills": [],
            "projects": [],
            "certificates": [],
            "achievements": [],
            "feedback": f"Failed to extract details: {str(e)}"
        }
