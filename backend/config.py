import os

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
MODEL_NAME = os.getenv("MODEL_NAME", "gemma4:12b-it-q4_K_M")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
CHROMA_PERSIST_DIR = os.getenv("CHROMA_PERSIST_DIR", "./data/chroma")
USE_LLM_EVIDENCE_SELECTOR = os.getenv("USE_LLM_EVIDENCE_SELECTOR", "false").lower() == "true"
SEARCH_TOP_K = int(os.getenv("SEARCH_TOP_K", "16"))
MAX_EVIDENCE_ITEMS = int(os.getenv("MAX_EVIDENCE_ITEMS", "5"))
CONVERSATION_CONTEXT_CHARS = int(os.getenv("CONVERSATION_CONTEXT_CHARS", "6000"))
RETRIEVAL_CONTEXT_CHARS = int(os.getenv("RETRIEVAL_CONTEXT_CHARS", "1600"))

CHUNK_SIZE = 400
CHUNK_OVERLAP = 50

TEMPERATURE = 0.1
MAX_TOKENS = int(os.getenv("MAX_TOKENS", "768"))
OLLAMA_NUM_CTX = int(os.getenv("OLLAMA_NUM_CTX", "4096"))
