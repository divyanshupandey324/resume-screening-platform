def recommend_skills(
        candidate_skills,
        required_skills
):

    candidate_set = set(
        skill.lower()
        for skill in candidate_skills
    )

    required_set = set(
        skill.lower()
        for skill in required_skills
    )

    missing_skills = list(
        required_set -
        candidate_set
    )

    recommendations = []

    for skill in missing_skills:

        recommendations.append(

            f"Learn {skill}"

        )

    return {

        "missing_skills":
        missing_skills,

        "recommendations":
        recommendations
    }