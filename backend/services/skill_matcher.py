def match_skills(
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

    matched = list(
        candidate_set.intersection(
            required_set
        )
    )

    missing = list(
        required_set.difference(
            candidate_set
        )
    )

    if len(required_set) == 0:

        score = 0

    else:

        score = round(
            (
                len(matched)
                /
                len(required_set)
            )
            * 100,
            2
        )

    return {

        "matched_skills":
        matched,

        "missing_skills":
        missing,

        "skill_match_percentage":
        score
    }