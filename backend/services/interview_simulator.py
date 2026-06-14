def generate_interview_feedback(
        answer
):

    length = len(answer)

    if length > 100:

        return {

            "score":90,

            "feedback":
            "Strong answer"
        }

    elif length > 50:

        return {

            "score":75,

            "feedback":
            "Good answer"
        }

    return {

        "score":50,

        "feedback":
        "Needs improvement"
    }