def generate_analytics(
        candidates
):
    total_candidates = len(candidates)
    shortlisted = 0
    total_score = 0
    total_skill_match = 0

    for candidate in candidates:
        score = candidate.get("score", 0)
        skill_match = candidate.get("skill_match", 0)
        
        total_score += score
        total_skill_match += skill_match

        if score >= 50:
            shortlisted += 1

    avg_score = round(total_score / total_candidates, 2) if total_candidates > 0 else 0
    avg_skill_match = round(total_skill_match / total_candidates, 2) if total_candidates > 0 else 0

    return {
        "total_candidates": total_candidates,
        "shortlisted": shortlisted,
        "rejected": total_candidates - shortlisted,
        "average_score": avg_score,
        "average_skill_match": avg_skill_match
    }