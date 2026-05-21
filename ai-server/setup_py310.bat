@echo off
echo ============================================================
echo  3D Collector AI Server - Python 3.10 Environment Setup
echo ============================================================

REM Check if Python 3.10 is installed
py -3.10 --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Python 3.10 is not installed!
    echo.
    echo Please download and install Python 3.10 first:
    echo https://www.python.org/ftp/python/3.10.16/python-3.10.16-amd64.exe
    echo.
    echo Make sure to check "Add Python 3.10 to PATH" during installation,
    echo OR just install it and run this script again.
    pause
    exit /b 1
)

echo [OK] Python 3.10 found
py -3.10 --version

REM Create virtual environment
echo.
echo Creating virtual environment (.venv310)...
py -3.10 -m venv .venv310

REM Activate
call .venv310\Scripts\activate.bat

echo.
echo Installing PyTorch 2.4.1 + CUDA 12.4...
pip install torch==2.4.1+cu124 torchvision==0.19.1+cu124 torchaudio==2.4.1+cu124 --index-url https://download.pytorch.org/whl/cu124

echo.
echo Installing pre-compiled gsplat 1.5.3 (Python 3.10 + CUDA 12.4 wheel)...
pip install https://github.com/nerfstudio-project/gsplat/releases/download/v1.5.3/gsplat-1.5.3+pt24cu124-cp310-cp310-win_amd64.whl

echo.
echo Installing pycolmap and other dependencies...
pip install pycolmap==4.0.4
pip install fastapi==0.115.6 "uvicorn[standard]==0.32.1" httpx==0.28.1 python-dotenv==1.0.1 "pydantic==2.10.3" "pydantic-settings==2.7.0"
pip install torchmetrics rich packaging

echo.
echo ============================================================
echo  Setup complete!
echo  Run the server with: start_server.bat
echo ============================================================
pause
