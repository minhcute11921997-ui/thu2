from collections import OrderedDict
import re
import unicodedata

import chromadb
from sentence_transformers import SentenceTransformer
import torch

from config import CHROMA_PERSIST_DIR, EMBEDDING_MODEL


STOPWORDS = {
    "a",
    "ai",
    "anh",
    "ban",
    "bang",
    "bi",
    "bị",
    "cac",
    "các",
    "cai",
    "cái",
    "can",
    "cần",
    "cho",
    "co",
    "có",
    "cua",
    "của",
    "de",
    "để",
    "di",
    "đi",
    "duoc",
    "được",
    "gi",
    "gì",
    "hay",
    "hoi",
    "hỏi",
    "khi",
    "khong",
    "không",
    "la",
    "là",
    "lam",
    "làm",
    "mot",
    "một",
    "nao",
    "nào",
    "nen",
    "nên",
    "neu",
    "nếu",
    "nhung",
    "những",
    "phan",
    "phần",
    "ra",
    "se",
    "sẽ",
    "thi",
    "thì",
    "trong",
    "thuoc",
    "thuộc",
    "tu",
    "từ",
    "va",
    "và",
    "ve",
    "về",
    "nguoi",
    "người",
}


def normalize_text(value: str) -> str:
    value = unicodedata.normalize("NFD", value.lower())
    value = "".join(char for char in value if unicodedata.category(char) != "Mn")
    value = value.replace("đ", "d")
    return value


def keyword_terms(value: str) -> set[str]:
    normalized = normalize_text(value)
    return {
        token
        for token in re.findall(r"[a-z0-9]+", normalized)
        if len(token) >= 2 and token not in STOPWORDS
    }


def lexical_score(query_terms: set[str], document: str) -> float:
    if not query_terms:
        return 0

    document_terms = keyword_terms(document)
    if not document_terms:
        return 0

    overlap = query_terms & document_terms
    return len(overlap) / len(query_terms)


class VectorStore:
    def __init__(self):
        self.client = chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)
        self.collection = self.client.get_or_create_collection(name="corporate_documents")

        if torch.cuda.is_available():
            device = "cuda"
        elif torch.backends.mps.is_available():
            device = "mps"
        else:
            device = "cpu"
        print(f"Khoi tao Embedding model tren: {device.upper()}")
        self.embedding_model = SentenceTransformer(EMBEDDING_MODEL, device=device)

    def add_chunks(self, document_id: str, filename: str, stored_filename: str, chunks: list[str]):
        if not chunks:
            return

        embeddings = self.embedding_model.encode(
            chunks,
            batch_size=32,
            show_progress_bar=False,
        ).tolist()
        ids = [f"{document_id}_{index}" for index in range(len(chunks))]
        metadatas = [
            {
                "document_id": document_id,
                "filename": filename,
                "stored_filename": stored_filename,
                "chunk_index": index + 1,
            }
            for index in range(len(chunks))
        ]

        self.collection.add(
            embeddings=embeddings,
            documents=chunks,
            metadatas=metadatas,
            ids=ids,
        )

    def search_candidates(self, query: str, top_k: int = 24):
        query_embedding = self.embedding_model.encode(
            [query],
            show_progress_bar=False,
        ).tolist()
        results = self.collection.query(
            query_embeddings=query_embedding,
            n_results=max(top_k, 1),
            include=["documents", "metadatas", "distances"],
        )

        if not results["documents"] or not results["documents"][0]:
            return []

        query_terms = keyword_terms(query)
        candidates = []
        seen = set()

        for document, metadata, distance in zip(
            results["documents"][0],
            results["metadatas"][0],
            results["distances"][0],
        ):
            key = (metadata.get("document_id"), metadata.get("chunk_index"), document[:80])
            if key in seen:
                continue
            seen.add(key)

            score = lexical_score(query_terms, document)
            document_terms = keyword_terms(document)
            candidates.append(
                {
                    "content": document,
                    "metadata": metadata,
                    "distance": distance,
                    "lexical_score": score,
                    "matched_terms": sorted(query_terms & document_terms),
                }
            )

        return candidates

    def search(self, query: str, top_k: int = 3):
        candidates = self.search_candidates(query, top_k=max(top_k * 6, top_k))
        if not candidates:
            return []

        best_distance = min(item["distance"] for item in candidates)
        distance_margin = 0.15
        candidates = [
            item
            for item in candidates
            if item["distance"] <= best_distance + distance_margin
        ]
        candidates.sort(key=lambda item: (item["distance"], -item["lexical_score"]))
        max_lexical_score = max((item["lexical_score"] for item in candidates), default=0)
        lexical_floor = max(0.2, max_lexical_score * 0.5)
        relevant = [
            item
            for item in candidates
            if item["lexical_score"] >= lexical_floor
        ]

        return (relevant or candidates)[:top_k]

    def get_stats(self):
        count = self.collection.count()
        results = self.collection.get(include=["metadatas"])
        unique_docs = {
            metadata["document_id"]
            for metadata in results.get("metadatas") or []
            if metadata.get("document_id")
        }
        return {
            "dataset_name": "local_documents",
            "total_chunks": count,
            "total_documents": len(unique_docs),
        }

    def list_documents(self):
        results = self.collection.get(include=["metadatas"])
        return self._documents_from_metadatas(results.get("metadatas") or [])

    def get_dataset_overview(self):
        results = self.collection.get(include=["metadatas"])
        metadatas = results.get("metadatas") or []
        documents = self._documents_from_metadatas(metadatas)
        return {
            "dataset": {
                "dataset_name": "local_documents",
                "total_chunks": len(metadatas),
                "total_documents": len(documents),
            },
            "documents": documents,
        }

    @staticmethod
    def _documents_from_metadatas(metadatas: list[dict]):
        documents = OrderedDict()

        for metadata in metadatas:
            document_id = metadata.get("document_id")
            filename = metadata.get("filename")
            if not document_id or not filename:
                continue

            if document_id not in documents:
                documents[document_id] = {
                    "document_id": document_id,
                    "filename": filename,
                    "stored_filename": metadata.get("stored_filename", ""),
                    "chunks_indexed": 0,
                }

            documents[document_id]["chunks_indexed"] += 1

        return list(documents.values())

    def delete_document(self, document_id: str) -> dict:
        results = self.collection.get(where={"document_id": document_id}, include=["metadatas"])
        ids = results.get("ids") or []
        if not ids:
            return {"deleted": False, "chunks_deleted": 0, "stored_filenames": []}

        stored_filenames = sorted(
            {
                metadata.get("stored_filename")
                for metadata in results.get("metadatas") or []
                if metadata.get("stored_filename")
            }
        )
        self.collection.delete(ids=ids)

        return {
            "deleted": True,
            "chunks_deleted": len(ids),
            "stored_filenames": stored_filenames,
        }
