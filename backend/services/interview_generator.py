def generate_questions(
        skills
):

    question_bank = {

        "python":[

            "What are decorators?",

            "Explain generators.",

            "Difference between list and tuple?"
        ],

        "sql":[

            "What is JOIN?",

            "Explain normalization.",

            "Difference between DELETE and TRUNCATE?"
        ],

        "machine learning":[

            "What is overfitting?",

            "Explain gradient descent.",

            "Difference between supervised and unsupervised learning?"
        ],

        "fastapi":[

            "What is dependency injection?",

            "Explain middleware.",

            "How does FastAPI improve performance?"
        ],

        "docker":[

            "What is a container?",

            "Difference between image and container?",

            "Explain Dockerfile."
        ]
    }

    questions = []

    for skill in skills:

        skill = skill.lower()

        if skill in question_bank:

            questions.extend(
                question_bank[skill]
            )

    return questions