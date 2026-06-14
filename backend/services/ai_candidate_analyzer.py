from services.gemini_service import model


def analyze_candidate(
        candidate_data
):

    prompt = f"""

    Analyze this candidate.

    Candidate:

    {candidate_data}

    Give:

    - Strengths

    - Weaknesses

    - Hiring Recommendation

    - Skill Gap Analysis

    """

    response = model.generate_content(
        prompt
    )

    return response.text