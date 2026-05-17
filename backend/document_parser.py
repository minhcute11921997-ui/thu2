import os
import fitz  # PyMuPDF
import docx
import markdown
from config import CHUNK_SIZE, CHUNK_OVERLAP

class DocumentParser:
    @staticmethod
    def parse_pdf(file_path: str) -> str:
        text = ""
        with fitz.open(file_path) as doc:
            for page in doc:
                text += page.get_text("text") + "\n"
        return text

    @staticmethod
    def parse_docx(file_path: str) -> str:
        text = ""
        doc = docx.Document(file_path)
        for para in doc.paragraphs:
            text += para.text + "\n"
        return text

    @staticmethod
    def parse_txt(file_path: str) -> str:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()

    @staticmethod
    def chunk_text(text: str) -> list[str]:
        words = text.replace('\n', ' ').split()
        chunks = []
        i = 0
        while i < len(words):
            chunk = " ".join(words[i:i + CHUNK_SIZE])
            chunks.append(chunk)
            i += CHUNK_SIZE - CHUNK_OVERLAP
        return chunks

    @classmethod
    def process_file(cls, file_path: str) -> list[str]:
        ext = os.path.splitext(file_path)[1].lower()
        if ext == '.pdf':
            text = cls.parse_pdf(file_path)
        elif ext in ['.docx', '.doc']:
            text = cls.parse_docx(file_path)
        elif ext in ['.txt', '.md', '.csv']:
            text = cls.parse_txt(file_path)
        else:
            raise ValueError(f"Định dạng {ext} không được hỗ trợ.")
            
        return cls.chunk_text(text)
