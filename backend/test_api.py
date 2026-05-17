import pytest
from fastapi.testclient import TestClient
from main import app
import os

client = TestClient(app)

def test_full_flow():
    # 1. Tạo file test
    test_file = "hop_dong_A.txt"
    with open(test_file, "w", encoding="utf-8") as f:
        f.write("Hợp đồng A quy định điều khoản thanh toán là 30 ngày sau khi nhận được hàng hóa hợp lệ.")
        
    # 2. Test Upload
    with open(test_file, "rb") as f:
        response = client.post("/upload", files={"file": (test_file, f, "text/plain")})
        
    assert response.status_code == 200
    doc_id = response.json()["document_id"]
    
    # 3. Test Query RAG
    query_res = client.post("/query", json={"question": "Điều khoản thanh toán trong hợp đồng A là gì?"})
    assert query_res.status_code == 200
    assert "30" in query_res.json()["answer"]
    
    # 4. Test Summarize
    sum_res = client.post("/summarize", json={"document_id": doc_id})
    assert sum_res.status_code == 200
    assert len(sum_res.json()["summary"]) > 0
    
    # Cleanup
    os.remove(test_file)
