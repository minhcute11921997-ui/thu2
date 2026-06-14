from pathlib import Path
import json
import re
import shutil
import uuid

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from document_parser import DocumentParser
from ollama_client import OllamaClient
from prompts import QA_SYSTEM_PROMPT, SUMMARIZE_SYSTEM_PROMPT
from config import MAX_EVIDENCE_ITEMS, SEARCH_TOP_K, USE_LLM_EVIDENCE_SELECTOR
from vector_store import VectorStore, keyword_terms

app = FastAPI(title="LocalAI DocManager API")

UPLOAD_DIR = Path("uploads")
SUPPORTED_EXTENSIONS = set(DocumentParser.supported_extensions())

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR.mkdir(exist_ok=True)

vector_store = VectorStore()
ollama_client = OllamaClient()


class QueryRequest(BaseModel):
    question: str
    conversation_context: str | None = None


class SummarizeRequest(BaseModel):
    document_id: str


class DeleteDocumentRequest(BaseModel):
    document_id: str


def format_retrieved_context(results: list[dict]) -> str:
    context_blocks = []
    for index, result in enumerate(results, start=1):
        metadata = result["metadata"]
        filename = metadata.get("filename", "unknown")
        chunk_index = metadata.get("chunk_index", index)
        content = result["content"]
        context_blocks.append(f"[Nguon: {filename}, doan {chunk_index}]\n{content}")

    return "\n\n---\n\n".join(context_blocks)


def ensure_cited_answer(answer: str) -> str:
    refusal = "Tôi không tìm thấy thông tin có trích dẫn trong tài liệu đã cung cấp."
    normalized = answer.strip()
    if normalized.startswith("Tôi không tìm thấy"):
        return normalized

    content_lines = [
        line.strip()
        for line in normalized.splitlines()
        if line.strip() and not line.strip().startswith("[Nguon:")
    ]
    citation_required_lines = [
        line
        for line in content_lines
        if not line.endswith(":")
        and not line.lower().startswith(("du kien", "phan tich", "ket luan", "khuyen nghi", "du lieu con thieu"))
        and not line.lower().startswith(("dữ kiện", "phân tích", "kết luận", "khuyến nghị", "dữ liệu còn thiếu"))
    ]
    if citation_required_lines and all("[Nguon:" in line for line in citation_required_lines):
        return normalized
    return refusal


def has_cited_answer(answer: str) -> bool:
    return ensure_cited_answer(answer) == answer.strip()


def attach_missing_citations(answer: str, results: list[dict]) -> str:
    if not results:
        return answer

    primary_metadata = results[0]["metadata"]
    filename = primary_metadata.get("filename", "unknown")
    chunk_index = primary_metadata.get("chunk_index", 1)
    citation = f"[Nguon: {filename}, doan {chunk_index}]"
    fixed_lines = []

    for line in answer.strip().splitlines():
        stripped = line.strip()
        if not stripped:
            fixed_lines.append(line)
        elif stripped.endswith(":") or stripped.startswith("[Nguon:") or "[Nguon:" in stripped:
            fixed_lines.append(line)
        else:
            fixed_lines.append(f"{line} {citation}")

    return "\n".join(fixed_lines).strip()


def sanitize_citations(answer: str, results: list[dict]) -> str:
    if not results:
        return answer

    valid_citations = {
        f"[Nguon: {item['metadata'].get('filename', 'unknown')}, doan {item['metadata'].get('chunk_index', index)}]"
        for index, item in enumerate(results, start=1)
    }
    fallback = next(iter(valid_citations))

    def replace(match: re.Match[str]) -> str:
        citation = match.group(0)
        return citation if citation in valid_citations else fallback

    return re.sub(r"\[Nguon:\s*[^\]]+\]", replace, answer)


def build_evidence_fallback(results: list[dict]) -> str:
    lines = [
        "Tôi chưa tạo được phân tích đủ chắc bằng mô hình, nhưng các căn cứ liên quan trong dataset là:"
    ]
    for index, result in enumerate(results[:3], start=1):
        metadata = result["metadata"]
        filename = metadata.get("filename", "unknown")
        chunk_index = metadata.get("chunk_index", index)
        content = " ".join(result["content"].split())
        excerpt = content[:500] + ("..." if len(content) > 500 else "")
        lines.append(f"- Căn cứ {index}: {excerpt} [Nguon: {filename}, doan {chunk_index}]")

    lines.append("Bạn có thể đặt lại câu hỏi cụ thể hơn theo các căn cứ trên để tôi phân tích hẹp hơn.")
    return "\n".join(lines)


def select_relevant_evidence(question: str, candidates: list[dict], max_items: int = MAX_EVIDENCE_ITEMS) -> list[dict]:
    if not candidates:
        return []

    query_terms = keyword_terms(question)
    strict_terms = {term for term in query_terms if len(term) >= 4}
    if strict_terms and not any(
        strict_terms & set(item.get("matched_terms", []))
        for item in candidates
    ):
        return []

    ranked_candidates = sorted(
        candidates,
        key=lambda item: (item["distance"], -item.get("lexical_score", 0)),
    )[:18]
    max_lexical_score = max((item.get("lexical_score", 0) for item in ranked_candidates), default=0)
    if max_lexical_score < 0.25:
        return []

    lexical_floor = max(0.25, max_lexical_score * 0.45)
    best_distance = min(item["distance"] for item in ranked_candidates)
    close_candidates = [
        item
        for item in ranked_candidates
        if item["distance"] <= best_distance + 0.08
        and item.get("lexical_score", 0) >= lexical_floor
        and (not strict_terms or strict_terms & set(item.get("matched_terms", [])))
    ]

    if not USE_LLM_EVIDENCE_SELECTOR:
        return close_candidates[:max_items]

    evidence_lines = []
    for index, item in enumerate(ranked_candidates, start=1):
        metadata = item["metadata"]
        filename = metadata.get("filename", "unknown")
        chunk_index = metadata.get("chunk_index", index)
        excerpt = " ".join(item["content"].split())[:700]
        evidence_lines.append(
            f"{index}. [Nguon: {filename}, doan {chunk_index}] {excerpt}"
        )

    selector_prompt = (
        "Chon cac doan bang chung that su tra loi truc tiep cau hoi hien tai. "
        "Bo qua doan chi trung tu khoa nhung khong dung noi dung cau hoi. "
        "Chi tra ve JSON array cac so thu tu, vi du [1,3]. Neu khong co doan phu hop, tra ve [].\n\n"
        f"Cau hoi hien tai: {question}\n\n"
        "Cac doan ung vien:\n" + "\n".join(evidence_lines)
    )
    raw_selection = ollama_client.generate(
        prompt=selector_prompt,
        system_prompt="Ban la bo loc bang chung. Chi tra ve JSON array, khong giai thich.",
    )

    selected_indexes: list[int] = []
    match = re.search(r"\[[\d,\s]+\]", raw_selection)
    if match:
        try:
            selected_indexes = [int(value) for value in json.loads(match.group(0))]
        except Exception:
            selected_indexes = []

    selected = [
        ranked_candidates[index - 1]
        for index in selected_indexes
        if 1 <= index <= len(ranked_candidates)
    ]
    lexical_floor = max(0.25, max_lexical_score * 0.45)
    selected = [
        item
        for item in selected
        if item.get("lexical_score", 0) >= lexical_floor
        and (not strict_terms or strict_terms & set(item.get("matched_terms", [])))
    ]

    if selected:
        return selected[:max_items]

    return close_candidates[:max_items]


@app.get("/health")
async def health_check():
    return {"status": "ok"}


@app.get("/supported-file-types")
async def supported_file_types():
    return {"extensions": DocumentParser.supported_extensions()}


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    file_path = None
    try:
        original_name = Path(file.filename or "document").name
        extension = Path(original_name).suffix.lower()
        if extension not in SUPPORTED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"Dinh dang {extension or 'khong xac dinh'} khong duoc ho tro.",
            )

        doc_id = str(uuid.uuid4())
        stored_filename = f"{doc_id}_{original_name}"
        file_path = UPLOAD_DIR / stored_filename

        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        chunks = DocumentParser.process_file(str(file_path))
        if not chunks:
            file_path.unlink(missing_ok=True)
            raise HTTPException(status_code=400, detail="Tai lieu khong co noi dung de lap chi muc.")

        vector_store.add_chunks(doc_id, original_name, stored_filename, chunks)

        return {
            "message": "Tai len va xu ly thanh cong",
            "document_id": doc_id,
            "filename": original_name,
            "stored_filename": stored_filename,
            "chunks_indexed": len(chunks),
        }
    except HTTPException:
        raise
    except ValueError as exc:
        if file_path and file_path.exists():
            file_path.unlink()
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        if file_path and file_path.exists():
            file_path.unlink()
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.get("/documents")
async def list_documents():
    return vector_store.get_dataset_overview()


@app.delete("/documents/{document_id}")
async def delete_document(document_id: str):
    result = vector_store.delete_document(document_id)
    if not result["deleted"]:
        raise HTTPException(status_code=404, detail="Khong tim thay tai lieu de xoa.")

    deleted_files = []
    stored_filenames = result["stored_filenames"] or [path.name for path in UPLOAD_DIR.glob(f"{document_id}_*")]
    for stored_filename in stored_filenames:
        file_path = UPLOAD_DIR / Path(stored_filename).name
        if file_path.exists():
            file_path.unlink()
            deleted_files.append(file_path.name)

    return {
        "message": "Da xoa tai lieu khoi dataset local.",
        "document_id": document_id,
        "chunks_deleted": result["chunks_deleted"],
        "files_deleted": deleted_files,
    }


@app.post("/documents/delete")
async def delete_document_compat(req: DeleteDocumentRequest):
    return await delete_document(req.document_id)


@app.post("/query")
async def query_document(req: QueryRequest):
    try:
        question = req.question.strip()
        if not question:
            raise HTTPException(status_code=400, detail="Cau hoi khong duoc de trong.")

        conversation_context = (req.conversation_context or "").strip()[:2500]
        candidates = vector_store.search_candidates(question, top_k=SEARCH_TOP_K)
        results = select_relevant_evidence(question, candidates, max_items=MAX_EVIDENCE_ITEMS)
        if not results:
            return {"answer": "Khong tim thay thong tin phu hop trong co so du lieu.", "sources": []}

        context = format_retrieved_context(results)
        sources = sorted({result["metadata"]["filename"] for result in results})

        answer = ollama_client.generate(
            prompt=(
                "Các đoạn trong TÀI LIỆU TRÍCH XUẤT đã được hệ thống chọn vì liên quan đến câu hỏi hiện tại. "
                "Hãy dùng các đoạn đó để trả lời, không từ chối nếu có căn cứ phù hợp. "
                "Trả lời trực tiếp đúng câu hỏi hiện tại trước, sau đó mới phân tích. "
                "Phân tích tình huống/câu hỏi sau bằng cách suy luận từ TÀI LIỆU TRÍCH XUẤT. "
                "Được đưa ra kết luận, rủi ro, hệ quả và khuyến nghị nếu có căn cứ. "
                "Mỗi nhận định nội dung phải có trích dẫn ASCII [Nguon: ten file, doan N] ngay trong cùng dòng. "
                "Không tự tính ra số tiền/tỷ lệ mới nếu tài liệu không nêu công thức tính. "
                "Nếu thiếu dữ liệu cho một phần, nói rõ thiếu dữ liệu.\n\n"
                f"Ngữ cảnh riêng của cuộc trò chuyện:\n{conversation_context or 'Không có.'}\n\n"
                f"Câu hỏi hiện tại: {question}"
            ),
            system_prompt=QA_SYSTEM_PROMPT.format(context=context),
        )
        if not has_cited_answer(answer):
            answer = ollama_client.generate(
                prompt=(
                    "Da co can cu lien quan trong TAI LIEU TRICH XUAT. Hay tra loi dua tren can cu do, khong tu choi neu can cu lien quan. "
                    "Tra loi lai theo DUNG dinh dang duoi day. Khong viet cau nao neu khong co tag [Nguon: ...] "
                    "o cuoi cung dong. Duoc phan tich va suy luan, nhung moi suy luan phai dua tren du kien trong "
                    "TAI LIEU TRICH XUAT. Khong tu quy doi ty le/ngay/thang neu khong co cong thuc trong tai lieu.\n\n"
                    "- Du kien: <neu du kien lien quan> [Nguon: ten file, doan N]\n"
                    "- Phan tich: <ket noi du kien voi tinh huong, neu rui ro/he qua> [Nguon: ten file, doan N]\n"
                    "- Ket luan/khuyen nghi: <hanh dong nen lam hoac ket luan> [Nguon: ten file, doan N]\n\n"
                    f"Ngu canh cuoc tro chuyen:\n{conversation_context or 'Khong co.'}\n\n"
                    f"Tinh huong/cau hoi hien tai: {question}"
                ),
                system_prompt=QA_SYSTEM_PROMPT.format(context=context),
            )

        answer = sanitize_citations(answer, results)
        final_answer = ensure_cited_answer(answer)
        if final_answer.startswith("Tôi không tìm thấy") and results:
            final_answer = ensure_cited_answer(sanitize_citations(attach_missing_citations(answer, results), results))
        if final_answer.startswith("Tôi không tìm thấy") and results:
            final_answer = build_evidence_fallback(results)

        return {"answer": final_answer, "sources": sources}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post("/summarize")
async def summarize_document(req: SummarizeRequest):
    try:
        results = vector_store.collection.get(where={"document_id": req.document_id}, include=["documents", "metadatas"])
        if not results or not results["documents"]:
            raise HTTPException(status_code=404, detail="Khong tim thay tai lieu.")

        summary_context = format_retrieved_context(
            [
                {"content": document, "metadata": metadata}
                for document, metadata in zip(results["documents"], results["metadatas"])
            ]
        )[:4000]
        summary = ollama_client.generate(
            prompt=(
                "Tóm tắt ngay nội dung trong phần VĂN BẢN. "
                "Chỉ trả về các gạch đầu dòng, mỗi dòng phải có [Nguon: ten file, doan N]."
            ),
            system_prompt=SUMMARIZE_SYSTEM_PROMPT.format(text=summary_context),
        )
        return {"summary": ensure_cited_answer(summary)}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.get("/stats")
async def get_stats():
    return vector_store.get_stats()
