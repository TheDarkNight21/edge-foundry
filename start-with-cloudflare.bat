@echo off
echo ========================================
echo Edge Foundry - Starting with Cloudflare Tunnel
echo ========================================
echo.

REM Check if cloudflared is available
cloudflared version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ cloudflared is not installed!
    echo.
    echo Please install cloudflared:
    echo 1. Go to https://github.com/cloudflare/cloudflared/releases
    echo 2. Download cloudflared-windows-amd64.exe
    echo 3. Rename it to cloudflared.exe
    echo 4. Place it in this folder or add to PATH
    echo.
    pause
    exit /b 1
)

echo ✅ cloudflared is available
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
echo 🌐 Starting Cloudflare tunnel...
echo This will create a public URL for your backend
echo.

REM Start Cloudflare tunnel
start "Cloudflare Tunnel" cmd /k "cloudflared tunnel --url http://localhost:8000"

echo ⏳ Cloudflare tunnel is starting...
echo Please check the Cloudflare tunnel window for the public URL
echo It should look like: https://abc123.trycloudflare.com
echo.

REM Wait a moment for tunnel to establish
timeout /t 5 /nobreak >nul

echo ========================================
echo Edge Foundry is Running!
echo ========================================
echo.
echo 🌐 Backend URLs:
echo   Local:  http://localhost:8000
echo   Public: Check Cloudflare tunnel window for URL
echo.
echo 📱 For MacBook Access:
echo   1. Get the public URL from Cloudflare tunnel window
echo   2. Use that URL in your MacBook frontend
echo   3. Run: ./setup-macbook.sh on MacBook
echo.
echo 🖥️  For Windows Dashboard:
echo   Press any key to start the dashboard on Windows...
echo   (You'll need to update the .env file first with the tunnel URL)
echo.
pause

REM Start dashboard on Windows
echo 🌐 Starting Dashboard on Windows...
cd dashboard
set BROWSER=none
npm start
