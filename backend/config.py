import os

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
MODEL_NAME = "llama3.2" # 3B parameters tối ưu cho Mac
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
CHROMA_PERSIST_DIR = os.getenv("CHROMA_PERSIST_DIR", "./data/chroma")

# Chunking config
CHUNK_SIZE = 400
CHUNK_OVERLAP = 50

# LLM Config
TEMPERATURE = 0.1 # Tránh ảo giác (hallucination)
MAX_TOKENS = 1024
