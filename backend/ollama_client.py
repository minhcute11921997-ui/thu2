import requests
from config import OLLAMA_HOST, MODEL_NAME, TEMPERATURE, MAX_TOKENS

class OllamaClient:
    def __init__(self):
        self.base_url = OLLAMA_HOST
        
    def generate(self, prompt: str, system_prompt: str = "") -> str:
        url = f"{self.base_url}/api/generate"
        payload = {
            "model": MODEL_NAME,
            "prompt": prompt,
            "system": system_prompt,
            "stream": False,
            "options": {
                "temperature": TEMPERATURE,
                "num_predict": MAX_TOKENS
            }
        }
        try:
            response = requests.post(url, json=payload, timeout=120)
            response.raise_for_status()
            return response.json().get("response", "")
        except Exception as e:
            raise Exception(f"Lỗi kết nối Ollama (Hãy chắc chắn Ollama đang chạy): {str(e)}")
