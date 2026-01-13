
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    # try reading from .env file directly if load_dotenv failed earlier
    try:
        with open('.env', 'r', encoding='utf-8') as f:
            for line in f:
                if line.startswith('GEMINI_API_KEY='):
                    api_key = line.strip().split('=')[1]
                    break
    except Exception:
        pass

print(f"API Key found: {api_key[:5]}..." if api_key else "API Key NOT found")

genai.configure(api_key=api_key)

try:
    print("Listing available models...")
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(m.name)
except Exception as e:
    print(f"Error listing models: {e}")
