@echo off
echo ========================================
echo Edge Foundry - Starting with localtunnel
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    pause
    exit /b 1
)

echo ✅ Node.js is available
echo.

REM Install localtunnel globally if not installed
echo 📦 Checking localtunnel installation...
npx localtunnel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 Installing localtunnel...
    npm install -g localtunnel
    if %errorlevel% neq 0 (
        echo ❌ Failed to install localtunnel
        pause
        exit /b 1
    )
)

echo ✅ localtunnel is available
echo.

echo 🚀 Starting Edge Foundry Backend...
start "Edge Foundry Backend" cmd /k "cd /d %~dp0 && python agent.py"

REM Wait for backend to start
echo ⏳ Waiting for backend to start...
timeout /t 5 /nobreak >nul

REM Test backend
echo 🔍 Testing backend...
curl -s http://localhost:8000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend is running
) else (
    echo ⚠️  Backend may still be starting...
)

echo.
echo 🌐 Starting localtunnel...
echo This will create a public URL for your backend
echo.

REM Start localtunnel
start "localtunnel" cmd /k "npx localtunnel --port 8000"

echo ⏳ localtunnel is starting...
echo Please check the localtunnel window for the public URL
echo It should look like: https://abc123.loca.lt
echo.
echo 📝 Once you have the URL:
echo   1. Copy the URL from the localtunnel window
echo   2. Update dashboard\.env with: REACT_APP_API_URL=YOUR_URL
echo   3. Or use it directly in your MacBook frontend
echo.

echo ========================================
echo Edge Foundry is Running!
echo ========================================
echo.
echo 🌐 Backend URLs:
echo   Local:  http://localhost:8000
echo   Public: Check localtunnel window for URL
echo.
echo 📱 For MacBook Access:
echo   1. Get the public URL from localtunnel window
echo   2. Use that URL in your MacBook frontend
echo.
echo 🖥️  For Windows Dashboard:
echo   Press any key to start the dashboard on Windows...
echo   (You'll need to update the .env file first)
echo.
pause

REM Start dashboard on Windows
echo 🌐 Starting Dashboard on Windows...
cd dashboard
set BROWSER=none
npm start
