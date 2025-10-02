@echo off
echo ========================================
echo Edge Foundry - Remote Internet Access Setup
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not available!
    echo Please ensure Python is installed and in PATH
    pause
    exit /b 1
)

echo ✅ Node.js and Python are available
echo.

REM Install Python dependencies
echo 📦 Installing Python dependencies...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ❌ Failed to install Python dependencies
    pause
    exit /b 1
)
echo ✅ Python dependencies installed
echo.

REM Install dashboard dependencies
echo 📦 Installing dashboard dependencies...
cd dashboard
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dashboard dependencies
    pause
    exit /b 1
)
cd ..
echo ✅ Dashboard dependencies installed
echo.

REM Create .env file for local backend
echo 📝 Creating .env file for local backend...
echo # Edge Foundry Dashboard Configuration > dashboard\.env
echo # Local backend for Windows PC >> dashboard\.env
echo REACT_APP_API_URL=http://localhost:8000 >> dashboard\.env
echo. >> dashboard\.env
echo # For remote access, this will be updated by the tunnel script >> dashboard\.env
echo # REACT_APP_API_URL=https://your-tunnel-url.ngrok.io >> dashboard\.env
echo ✅ .env file created
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo 🌐 Next Steps:
echo   1. Choose a tunneling method:
echo      - Option A: Use ngrok (recommended)
echo      - Option B: Use Cloudflare Tunnel
echo      - Option C: Use localtunnel
echo.
echo   2. Run the appropriate script:
echo      - For ngrok: start-with-ngrok.bat
echo      - For Cloudflare: start-with-cloudflare.bat
echo      - For localtunnel: start-with-localtunnel.bat
echo.
echo   3. The script will provide URLs for:
echo      - Backend API (for MacBook frontend)
echo      - Dashboard (if running on Windows)
echo.
pause
