@echo off
echo ==========================================
echo AI-Sync OpenDev - Package Installation
echo ==========================================
echo.

echo [1/3] Installing Backend packages...
cd /d "%~dp0backend"
python -m pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: Backend package installation failed!
    pause
    exit /b 1
)
echo Backend packages installed successfully!
echo.

echo [2/3] Installing Agents packages...
cd /d "%~dp0agents"
python -m pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: Agents package installation failed!
    pause
    exit /b 1
)
echo Agents packages installed successfully!
echo.

echo [3/3] Frontend packages already installed via pnpm.
echo.

echo ==========================================
echo All packages installed successfully!
echo ==========================================
echo.
echo Next steps:
echo 1. Run Supabase schema: Copy backend/schema.sql to Supabase SQL Editor
echo 2. Start services: run start-all.bat
echo.
pause
