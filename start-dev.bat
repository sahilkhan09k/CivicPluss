@echo off
echo ========================================
echo Starting CivicPulse Development Servers
echo ========================================
echo.

echo Starting Backend Server...
start "CivicPulse Backend" cmd /k "cd server && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting Frontend Client...
start "CivicPulse Frontend" cmd /k "cd client && npm run dev"

echo.
echo ========================================
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo ========================================
echo.
echo Press any key to exit this window...
pause >nul
