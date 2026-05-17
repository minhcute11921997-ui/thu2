# BÁO CÁO MÔN HỆ THỐNG THÔNG TIN QUẢN LÝ (MIS)
**Đề tài: Hệ thống Quản lý và Hỏi đáp Tài liệu Doanh nghiệp bằng Trí tuệ Nhân tạo Cục bộ (LocalAI DocManager)**

## 1. Giới thiệu vấn đề
Trong hoạt động doanh nghiệp, nhân sự phải xử lý hàng trăm văn bản (Hợp đồng, Báo cáo tài chính, Chính sách nhân sự) mỗi tuần. Tra cứu thủ công làm giảm hiệu suất. Dù các AI như ChatGPT rất thông minh, nhưng doanh nghiệp **bị cấm upload tài liệu bảo mật** lên môi trường Public Cloud vì rủi ro rò rỉ dữ liệu (Data Breach).

## 2. Mục tiêu hệ thống
Xây dựng một hệ thống thông tin ứng dụng công nghệ **RAG (Retrieval-Augmented Generation)** hoạt động **100% Offline (Local)** trên máy tính của người dùng:
- Xử lý, phân tích và tóm tắt tự động tài liệu định dạng PDF, Word, Text.
- Đóng vai trò là "Nhân viên ảo" trả lời câu hỏi nghiệp vụ dựa trên đúng tài liệu đã nạp.
- Đảm bảo quyền riêng tư và bảo mật dữ liệu cấp độ doanh nghiệp (Zero data egress).

## 3. Requirements (Yêu cầu chức năng / Phi chức năng)
- **Functional Requirements (FR):**
  - FR1: Hệ thống cho phép Upload tài liệu qua thao tác kéo-thả.
  - FR2: Tự động trích xuất nội dung, cắt đoạn (chunking) và lưu trữ dưới dạng toán học.
  - FR3: Chatbox giao tiếp ngôn ngữ tự nhiên tiếng Việt, yêu cầu trả lời kèm trích dẫn nguồn.
  - FR4: Tự động lập tóm tắt tài liệu bằng nút bấm.
- **Non-functional Requirements (NFR):**
  - NFR1 (Security): Toàn bộ Vector DB và LLM phải chạy offline tại `localhost`.
  - NFR2 (Performance): Tốc độ phản hồi tìm kiếm & trả lời QA < 7 giây (Optimize cho chip Apple M-Series).
  - NFR3 (Usability): Đóng gói thành Desktop Application (Tauri), UI/UX thân thiện không yêu cầu kiến thức lập trình.

## 4. Kiến trúc & Data Flow
Hệ thống tuân theo kiến trúc Client-Server (Cục bộ):
- **Frontend Client (Tauri + React):** Giao diện tương tác người dùng.
- **Backend API (FastAPI):** Orchestrator điều phối luồng dữ liệu.
- **Data Flow:**
  - *Luồng Nhập liệu:* User Upload -> Parser (PyMuPDF) -> Text -> Embedding Model (`all-MiniLM`) -> Lưu Vector vào ChromaDB.
  - *Luồng Truy vấn:* User Chat -> FastAPI -> ChromaDB Search (Top K chunks) -> Gép Context vào Prompt -> Gửi tới Llama 3.2 (Ollama) -> Sinh câu trả lời -> Trả về Client.

## 5. ERD Database (ASCII)
Vì sử dụng kiến trúc Vector Database (NoSQL), dữ liệu được tổ chức theo cấu trúc Collection:
```text
[ Document_Metadata ] 1 ----------- N [ Vector_Chunk (ChromaDB) ]
  - document_id (PK, UUID)              - chunk_id (PK, VD: docID_1)
  - filename (String)                   - document_id (FK)
  - upload_timestamp (Date)             - text_content (String)
  - total_chunks (Int)                  - embedding_vector (Array[Float, 384 dims])
```

## 6. Lộ trình phát triển (Gantt Chart)
```text
Tuần 1: Nghiên cứu mô hình LLM Local (Llama 3.2), Thiết lập ChromaDB.  [████████        ]
Tuần 2: Xây dựng Backend FastAPI, Tích hợp RAG (Retrieve-Generate).    [    ████████    ]
Tuần 3: Xây dựng Giao diện React, Tích hợp Tauri Desktop framework.    [        ████████]
Tuần 4: Testing hiệu năng, đóng gói hệ thống (.dmg/.app) và Báo cáo.   [            ████]
```

## 7. Mô hình kinh doanh (Business Model)
- **Revenue Model:** Bán License theo hình thức phần mềm đóng gói (On-Premise Software) giá $299/máy. Cung cấp gói dịch vụ cập nhật Model AI và Bảo trì với giá $99/năm/thiết bị.
- **Target Customer (B2B):** Các công ty Luật, Kiểm toán, Phòng Hành chính - Nhân sự, Khối Tài chính - Ngân hàng, nơi có quy định bảo mật "Không đưa dữ liệu ra khỏi mạng nội bộ".

## 8. Rủi ro & Giải pháp
- **Rủi ro 1: Ảo giác AI (Hallucination):** AI có thể tự bịa ra điều khoản không có trong hợp đồng.
  -> *Giải pháp:* Điều chỉnh config Temperature = 0.1. Thiết kế System Prompt bắt buộc hệ thống trả lời "Không tìm thấy" nếu không có context, đồng thời UI luôn hiển thị nguồn (Source) để User kiểm chứng.
- **Rủi ro 2: Phần cứng giới hạn:** Máy tính văn phòng không có GPU khủng.
  -> *Giải pháp:* Sử dụng mô hình `Llama 3.2 3B` nhẹ (chỉ tốn khoảng 2-3GB RAM) và dùng `SentenceTransformers` tận dụng bộ gia tốc Neural Engine (MPS) của Apple.

## 9. Kết luận
Dự án **LocalAI DocManager** chứng minh tính khả thi của việc dân chủ hóa AI trong doanh nghiệp mà không phải hy sinh bảo mật. Hệ thống giải quyết đúng nỗi đau về tra cứu văn bản, tăng hiệu suất lao động và mở ra tiềm năng thương mại lớn cho ngách phần mềm On-Premise AI.
