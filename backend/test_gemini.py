from services.gemini_service import model

response = model.generate_content(
    "Tell me about Python."
)

print(response.text)