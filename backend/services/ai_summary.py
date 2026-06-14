def generate_candidate_summary(
        candidate,
        score
):

    summary = f"""
Candidate {candidate.name}
has {candidate.experience_years}
years of experience.

The candidate possesses
{len(candidate.skills)}
 technical skills.

The overall screening score is
{score}%.

Education Score:
10th = {candidate.tenth_percentage}%

12th = {candidate.twelfth_percentage}%

Graduation CGPA =
{candidate.graduation_cgpa}

Projects Completed:
{len(candidate.projects)}

Certificates Earned:
{len(candidate.certificates)}

Achievements:
{len(candidate.achievements)}

Recommendation:

Suitable for further
technical evaluation.
"""

    return summary