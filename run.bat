@echo off
title Local AI Doc Manager
echo === LOCAL AI DOC MANAGER (Windows) ===

echo [1/3] Checking Ollama...
where ollama >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Ollama is not installed. Please download it from https://ollama.com
    pause
    exit /b
)

echo Starting Ollama Server...
start "Ollama Server" cmd /c "echo Starting Llama 3.2... && ollama pull llama3.2 && ollama run llama3.2"

echo [2/3] Starting Backend (FastAPI)...
cd backend
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)
start "FastAPI Backend" cmd /k "call venv\Scripts\activate.bat && pip install -r requirements.txt && uvicorn main:app --host 0.0.0.0 --port 8000"

echo [3/3] Starting Frontend (Tauri/React)...
cd ..\frontend
start "Vite Frontend" cmd /k "npm install && start http://localhost:5173 && npm run dev"

echo.
echo =========================================
echo ✅ ALL SYSTEMS ARE STARTING!
echo =========================================
echo - API Docs: http://localhost:8000/docs
echo - Tauri App will launch in a new window shortly.
echo.
echo Note: 3 new terminal windows have been opened for Ollama, Backend, and Frontend.
echo To shut down the system, simply close those terminal windows.
echo =========================================
pause
