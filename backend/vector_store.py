import chromadb
from chromadb.config import Settings
from config import CHROMA_PERSIST_DIR, EMBEDDING_MODEL
from sentence_transformers import SentenceTransformer
import torch

class VectorStore:
    def __init__(self):
        self.client = chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)
        self.collection = self.client.get_or_create_collection(name="corporate_documents")
        
        # Tối ưu hóa cho Apple Silicon (Sử dụng MPS - Metal Performance Shaders)
        device = "mps" if torch.backends.mps.is_available() else "cpu"
        print(f"🚀 Khởi tạo Embedding model trên: {device.upper()}")
        self.embedding_model = SentenceTransformer(EMBEDDING_MODEL, device=device)
        
    def add_chunks(self, document_id: str, filename: str, chunks: list[str]):
        if not chunks: return
        
        embeddings = self.embedding_model.encode(chunks).tolist()
        ids = [f"{document_id}_{i}" for i in range(len(chunks))]
        metadatas = [{"document_id": document_id, "filename": filename} for _ in chunks]
        
        self.collection.add(
            embeddings=embeddings,
            documents=chunks,
            metadatas=metadatas,
            ids=ids
        )
        
    def search(self, query: str, top_k: int = 3):
        query_embedding = self.embedding_model.encode([query]).tolist()
        results = self.collection.query(
            query_embeddings=query_embedding,
            n_results=top_k
        )
        
        if not results['documents'] or not results['documents'][0]:
            return []
            
        return [
            {"content": doc, "metadata": meta}
            for doc, meta in zip(results['documents'][0], results['metadatas'][0])
        ]
        
    def get_stats(self):
        count = self.collection.count()
        results = self.collection.get(include=['metadatas'])
        unique_docs = set(meta['document_id'] for meta in results['metadatas']) if results['metadatas'] else set()
        return {"total_chunks": count, "total_documents": len(unique_docs)}
