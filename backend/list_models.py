import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

with open("available_models.txt", "w") as f:
    f.write("Available Gemini models:\n")
    f.write("-" * 50 + "\n\n")
    
    for model in genai.list_models():
        if 'generateContent' in model.supported_generation_methods:
            f.write(f"Model: {model.name}\n")
            f.write(f"  Display Name: {model.display_name}\n")
            f.write(f"  Supported methods: {model.supported_generation_methods}\n\n")
    
    print("Models written to available_models.txt")
