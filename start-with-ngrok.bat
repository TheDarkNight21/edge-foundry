@echo off
echo ========================================
echo Edge Foundry - Starting with ngrok
echo ========================================
echo.

REM Check if ngrok is installed
ngrok version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ngrok is not installed!
    echo.
    echo Please install ngrok:
    echo 1. Go to https://ngrok.com/download
    echo 2. Download and extract ngrok.exe
    echo 3. Add ngrok.exe to your PATH or place it in this folder
    echo 4. Sign up for a free account at https://ngrok.com/
    echo 5. Get your authtoken from https://dashboard.ngrok.com/get-started/your-authtoken
    echo 6. Run: ngrok config add-authtoken YOUR_AUTHTOKEN
    echo.
    pause
    exit /b 1
)

echo ✅ ngrok is available
echo.

REM Check if ngrok is authenticated
ngrok config check >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  ngrok may not be authenticated
    echo Please run: ngrok config add-authtoken YOUR_AUTHTOKEN
    echo.
)

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
echo 🌐 Starting ngrok tunnel...
echo This will create a public URL for your backend
echo.

REM Start ngrok tunnel
start "ngrok Tunnel" cmd /k "ngrok http 8000 --log=stdout"

REM Wait for ngrok to start
echo ⏳ Waiting for ngrok to start...
timeout /t 3 /nobreak >nul

REM Get ngrok URL
echo 🔍 Getting ngrok URL...
for /f "tokens=2" %%a in ('curl -s http://localhost:4040/api/tunnels ^| findstr "public_url"') do (
    set "ngrok_url=%%a"
    goto :found_url
)
:found_url

REM Clean up the URL (remove quotes and commas)
set "ngrok_url=%ngrok_url:"=%"
set "ngrok_url=%ngrok_url:,=%"

if "%ngrok_url%"=="" (
    echo ⚠️  Could not get ngrok URL automatically
    echo Please check the ngrok window for the public URL
    echo It should look like: https://abc123.ngrok.io
    echo.
    echo Press any key to continue...
    pause >nul
) else (
    echo ✅ ngrok URL found: %ngrok_url%
    echo.
    echo 📝 Updating dashboard configuration...
    echo # Edge Foundry Dashboard Configuration > dashboard\.env
    echo # Remote backend via ngrok >> dashboard\.env
    echo REACT_APP_API_URL=%ngrok_url% >> dashboard\.env
    echo ✅ Dashboard configured for remote access
    echo.
)

echo ========================================
echo Edge Foundry is Running!
echo ========================================
echo.
echo 🌐 Backend URLs:
echo   Local:  http://localhost:8000
echo   Public: %ngrok_url%
echo.
echo 📱 For MacBook Access:
echo   1. Use the public URL above for API calls
echo   2. Run frontend on MacBook with this URL
echo.
echo 🖥️  For Windows Dashboard:
echo   Press any key to start the dashboard on Windows...
echo   (This will open http://localhost:3000)
echo.
pause

REM Start dashboard on Windows
echo 🌐 Starting Dashboard on Windows...
cd dashboard
set BROWSER=none
npm start
