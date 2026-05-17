# 🛡️ LocalAI DocManager

**LocalAI DocManager** là ứng dụng Desktop (Tauri) hỗ trợ quản lý, hỏi đáp và tóm tắt tài liệu dành cho doanh nghiệp. Điểm nhấn là hệ thống chạy **100% Offline cục bộ** bằng cách sử dụng Llama 3.2 qua Ollama và ChromaDB Vector Store, tối ưu phần cứng Apple Silicon (M1/M2/M3/M4). Đảm bảo quyền riêng tư và bảo mật dữ liệu tuyệt đối.

## 🚀 Tech Stack
- **Frontend App:** Tauri (Rust base), React 18, TypeScript, TailwindCSS.
- **Backend API:** Python FastAPI, Uvicorn.
- **Data & AI pipeline:** ChromaDB, `sentence-transformers` (chạy trên MPS/GPU), PyMuPDF, Markdown.
- **Local LLM Runner:** Ollama API.

## 🛠 Hướng dẫn Cài đặt & Khởi động
**Yêu cầu môi trường:** macOS Apple Silicon, đã cài đặt Node.js và Python 3.9+.

1. **Cài đặt Ollama** từ [ollama.com](https://ollama.com)
2. **Clone repository này** về máy.
3. Chạy lệnh tự động khởi động toàn bộ Stack:
   ```bash
   chmod +x run.sh
   ./run.sh
   ```
   *Script này sẽ tự động tải model LLama 3.2, cài đặt Backend dependencies, cài npm packages cho Frontend và tự động mở ứng dụng Desktop lên màn hình.*

## 🎥 Mô phỏng Sử dụng
- **Bước 1:** Kéo thả Hợp đồng/Báo cáo của bạn vào giao diện **Quản lý tài liệu**. AI sẽ Index dữ liệu ngay lập tức.
- **Bước 2:** Bấm nút **AI Tóm tắt** để bóc tách các ý chính của tài liệu.
- **Bước 3:** Chuyển qua tab **Chat & Hỏi đáp**, đặt câu hỏi bằng tiếng Việt (Ví dụ: *"Liệt kê cho tôi điều khoản thanh toán trong Hợp đồng A"*). Trợ lý AI sẽ lục tìm trong Database và trả lời kèm theo **Trích dẫn Nguồn** minh bạch.
