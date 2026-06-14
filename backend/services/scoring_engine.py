def calculate_score(candidate):

    score = 0

    # 10th Marks (5)

    score += min(
        (candidate.tenth_percentage / 100) * 5,
        5
    )

    # 12th Marks (5)

    score += min(
        (candidate.twelfth_percentage / 100) * 5,
        5
    )

    # Graduation (15)

    score += min(
        (candidate.graduation_cgpa / 10) * 15,
        15
    )

    # Experience (20)

    experience_score = min(
        candidate.experience_years * 4,
        20
    )

    score += experience_score

    # Skills (20)

    skills_score = min(
        len(candidate.skills) * 2,
        20
    )

    score += skills_score

    # Projects (10)

    project_score = min(
        len(candidate.projects) * 2,
        10
    )

    score += project_score

    # Certificates (10)

    certificate_score = min(
        len(candidate.certificates) * 2,
        10
    )

    score += certificate_score

    # Achievements (15)

    achievement_score = min(
        len(candidate.achievements) * 3,
        15
    )

    score += achievement_score

    return round(score, 2)