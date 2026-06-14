import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable is not set.")

genai.configure(
    api_key=API_KEY
)

for model in genai.list_models():
    if "generateContent" in model.supported_generation_methods:
        print(model.name)