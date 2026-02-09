@echo off
echo ==========================================
echo AI-Sync OpenDev - Starting All Services
echo ==========================================
echo.

echo Starting Frontend (http://localhost:3000)...
start "Frontend" cmd /k "cd /d %~dp0frontend && pnpm dev"

timeout /t 3 /nobreak > nul

echo Starting Backend (http://localhost:8000)...
start "Backend" cmd /k "cd /d %~dp0backend && python run.py"

timeout /t 3 /nobreak > nul

echo Starting Agents (http://localhost:8001)...
start "Agents" cmd /k "cd /d %~dp0agents && python run.py"

echo.
echo ==========================================
echo All services started!
echo ==========================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:8000/docs
echo Agents:   http://localhost:8001/docs
echo.
echo Close this window or press any key to exit...
pause > nul
