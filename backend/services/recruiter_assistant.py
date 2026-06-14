def recruiter_help(
        query
):

    query = query.lower()

    if "hire" in query:

        return "Check candidate rankings and shortlist top profiles."

    if "skills" in query:

        return "Analyze skill gaps before hiring."

    return "Please provide more details."