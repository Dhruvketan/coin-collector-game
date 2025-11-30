@echo off
setlocal enabledelayedexpansion
echo ========================================
echo   Coin Collector - Multiplayer Game
echo ========================================
echo.

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.7+ from python.org
    pause
    exit /b 1
)

echo [1/4] Checking dependencies...
pip show websockets >nul 2>&1
if errorlevel 1 (
    echo Installing websockets library...
    pip install websockets
    if errorlevel 1 (
        echo ERROR: Failed to install websockets
        pause
        exit /b 1
    )
)

echo [2/4] Starting game server...
start "Game Server" cmd /k "cd /d %~dp0 && python server.py"
timeout /t 2 /nobreak >nul

echo [3/4] Starting client web server...
start "Client Web Server" cmd /k "cd /d %~dp0client && python -m http.server 8080"
timeout /t 3 /nobreak >nul

echo [4/4] Opening game in browser...
start http://localhost:8080
timeout /t 2 /nobreak >nul
start http://localhost:8080
timeout /t 1 /nobreak >nul

echo.
echo ========================================
echo   Game Started Successfully!
echo ========================================
echo.
echo Server is running on localhost:8000
echo Client is available at http://localhost:8080
echo.
echo Two browser windows have been opened for Player 1 and Player 2
echo.
echo Press any key to stop the game and exit...
pause >nul

echo.
echo Stopping game servers...
REM Kill processes by window title (most reliable method)
taskkill /FI "WINDOWTITLE eq Game Server*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Client Web Server*" /F >nul 2>&1

REM Also kill by command line pattern (backup method)
wmic process where "commandline like '%%server.py%%'" delete >nul 2>&1
wmic process where "commandline like '%%http.server 8080%%'" delete >nul 2>&1

echo Game servers stopped.
timeout /t 1 /nobreak >nul

