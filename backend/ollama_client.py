import re

import requests

from config import MAX_TOKENS, MODEL_NAME, OLLAMA_HOST, OLLAMA_NUM_CTX, TEMPERATURE


class OllamaClient:
    def __init__(self):
        self.base_url = OLLAMA_HOST

    @staticmethod
    def _clean_response(text: str) -> str:
        text = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL | re.IGNORECASE)
        text = re.sub(r"(?is)^thinking\.\.\..*?\.\.\.done thinking\.", "", text).strip()
        return text.strip()

    def generate(self, prompt: str, system_prompt: str = "") -> str:
        url = f"{self.base_url}/api/chat"
        payload = {
            "model": MODEL_NAME,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt},
            ],
            "stream": False,
            "think": False,
            "keep_alive": "10m",
            "options": {
                "temperature": TEMPERATURE,
                "num_predict": MAX_TOKENS,
                "num_ctx": OLLAMA_NUM_CTX,
            },
        }
        try:
            response = requests.post(url, json=payload, timeout=180)
            response.raise_for_status()
            data = response.json()
            content = data.get("message", {}).get("content", "") or data.get("response", "")
            return self._clean_response(content)
        except Exception as exc:
            raise Exception(f"Loi ket noi Ollama hoac model {MODEL_NAME}: {str(exc)}") from exc
