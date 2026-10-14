@echo off
echo ======================================================================
echo Starting SmartResume: NLP-Based Resume Analysis & Ranking System
echo ======================================================================
echo.
echo [1/2] Starting Python Flask backend on port 5000...
start "SmartResume Backend" cmd /k "cd backend && python app.py"
timeout /t 3 /nobreak >nul
echo [2/2] Starting React Vite frontend on port 5173 (Network enabled)...
start "SmartResume Frontend" cmd /k "cd frontend && npm.cmd run dev -- --host 0.0.0.0 --port 5173"
echo.
echo Both servers are online!
echo Local PC: http://localhost:5173
echo Mobile Phone (same Wi-Fi): http://192.168.29.21:5173
echo.
pause
