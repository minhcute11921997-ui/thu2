from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import uuid
import shutil
from document_parser import DocumentParser
from vector_store import VectorStore
from ollama_client import OllamaClient
from prompts import QA_SYSTEM_PROMPT, SUMMARIZE_SYSTEM_PROMPT

app = FastAPI(title="LocalAI DocManager API")

# Setup CORS cho Frontend Tauri
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)

vector_store = VectorStore()
ollama_client = OllamaClient()

class QueryRequest(BaseModel):
    question: str

class SummarizeRequest(BaseModel):
    document_id: str

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        doc_id = str(uuid.uuid4())
        file_path = f"uploads/{doc_id}_{file.filename}"
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        chunks = DocumentParser.process_file(file_path)
        vector_store.add_chunks(doc_id, file.filename, chunks)
        
        return {
            "message": "Tải lên và xử lý thành công", 
            "document_id": doc_id, 
            "filename": file.filename, 
            "chunks_indexed": len(chunks)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/query")
async def query_document(req: QueryRequest):
    try:
        results = vector_store.search(req.question, top_k=4)
        if not results:
            return {"answer": "Không tìm thấy thông tin phù hợp trong cơ sở dữ liệu.", "sources": []}
            
        context = "\n---\n".join([r["content"] for r in results])
        sources = list({r["metadata"]["filename"] for r in results})
        
        answer = ollama_client.generate(
            prompt=req.question, 
            system_prompt=QA_SYSTEM_PROMPT.format(context=context)
        )
        
        return {"answer": answer, "sources": sources}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/summarize")
async def summarize_document(req: SummarizeRequest):
    try:
        results = vector_store.collection.get(where={"document_id": req.document_id})
        if not results or not results['documents']:
            raise HTTPException(status_code=404, detail="Không tìm thấy tài liệu")
            
        text = "\n".join(results['documents'])
        # Cắt bớt nếu file quá dài để vừa context window của model 3B
        text = text[:4000] 
        
        summary = ollama_client.generate(
            prompt="Hãy tóm tắt tài liệu này.", 
            system_prompt=SUMMARIZE_SYSTEM_PROMPT.format(text=text)
        )
        return {"summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stats")
async def get_stats():
    return vector_store.get_stats()
