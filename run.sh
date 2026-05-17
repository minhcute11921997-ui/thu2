#!/bin/bash
set -e

echo "=== LOCAL AI DOC MANAGER ==="

# Kiểm tra M-Series & Ollama
if [[ $(uname -m) == 'arm64' && $(uname) == 'Darwin' ]]; then
  echo "🚀 [OK] Mac Apple Silicon detected. Bật tối ưu hóa MPS."
  export PYTORCH_ENABLE_MPS_FALLBACK=1
fi

if ! command -v ollama &> /dev/null; then
    echo "❌ Lỗi: Chưa cài đặt Ollama. Hãy cài từ https://ollama.com"
    exit 1
fi

echo "📦 Kéo model Llama 3.2 3B (Nếu chưa có)..."
ollama pull llama3.2

echo "🤖 Khởi động Ollama server..."
# Ollama chạy mặc định background trên Mac, đánh thức nó:
ollama run llama3.2 "hello" > /dev/null 2>&1 &

echo "⚙️ Khởi động Backend..."
cd backend
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt > /dev/null 2>&1
uvicorn main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

echo "🖥️ Khởi động Frontend..."
cd ../frontend
npm install > /dev/null 2>&1
npm run tauri dev &
FRONTEND_PID=$!

echo "✅ HỆ THỐNG ĐÃ SẴN SÀNG!"
echo "- API Docs: http://localhost:8000/docs"
echo "- Tauri App đang mở..."
echo "Bấm Ctrl+C để tắt toàn bộ hệ thống."

trap "echo 'Đang tắt...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
