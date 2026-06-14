def calculate_job_match(
        candidate_skills,
        required_skills
):

    candidate_skills = [

        skill.lower()

        for skill in candidate_skills

    ]

    required_skills = [

        skill.lower()

        for skill in required_skills

    ]

    matched_skills = []

    missing_skills = []

    for skill in required_skills:

        if skill in candidate_skills:

            matched_skills.append(
                skill
            )

        else:

            missing_skills.append(
                skill
            )

    if len(required_skills) == 0:

        match_percentage = 0

    else:

        match_percentage = round(

            (
                len(matched_skills)

                /

                len(required_skills)

            )

            * 100,

            2

        )

    return {

        "matched_skills":
        matched_skills,

        "missing_skills":
        missing_skills,

        "match_percentage":
        match_percentage
    }