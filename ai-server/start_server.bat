@echo off
cd /d "%~dp0"

if not exist ".venv310\Scripts\python.exe" (
    echo [ERROR] Python 3.10 venv not found. Please run setup_py310.bat first.
    pause
    exit /b 1
)

echo Starting 3D Collector AI Server...
.venv310\Scripts\uvicorn.exe main:app --host 0.0.0.0 --port 8000 --reload
