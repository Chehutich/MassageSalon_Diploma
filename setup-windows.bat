@echo off
setlocal enabledelayedexpansion

:: Check if running in fixed terminal mode
if not defined TERMINAL_FIX (
    set "TERMINAL_FIX=1"
    echo [INFO] Launching persistent shell...
    start cmd /k "%~f0" %*
    exit /b
)

echo [STEP] Starting Massage Salon project setup for Windows...
echo [INFO] This window will stay open after finishing!
echo.

:: 1. Detect local IPv4
echo [STEP] Detecting network...
set "LOCAL_IP=127.0.0.1"
for /f "usebackq" %%f in (powershell -NoProfile -Command "(Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notlike '*Loopback*' -and $_.IPAddress -notlike '169.254.*' } | Select-Object -First 1).IPAddress") do (
    set "LOCAL_IP=%%f"
)
echo [INFO] Local IP detected: !LOCAL_IP!
echo.

:: 2. Setup environment files
set "TEMPLATE=.env-template"
if not exist "%TEMPLATE%" (
    echo [WARN] Root .env-template not found. Skipping environment setup.
    goto :dependencies
)

echo [FILE] Root: Creating .env with IP !LOCAL_IP!
powershell -Command "$c = Get-Content '%TEMPLATE%'; $c -replace '192.168.1.111', '!LOCAL_IP!' | Out-File -encoding utf8 .env"

if not exist "frontend" goto :check_desktop
echo [FILE] Frontend: Creating .env with IP !LOCAL_IP!
powershell -Command "$c = Get-Content '%TEMPLATE%'; $c -replace '192.168.1.111', '!LOCAL_IP!' -replace 'APP_URL', 'EXPO_PUBLIC_API_URL' | Out-File -encoding utf8 frontend\.env"

:check_desktop
if not exist "desktop" goto :dependencies
if exist "desktop\.env" goto :dependencies
echo [FILE] Desktop: Creating .env
echo DATABASE_URL="postgresql://admin:supersecret@localhost:5432/massagesalondb?schema=public" > desktop\.env

:dependencies
:: 3. Install frontend dependencies
if not exist "frontend" goto :check_desktop_deps
echo.
echo [STEP] Installing frontend dependencies...
pushd "frontend"
call npm install
echo [STEP] Generating API client (Orval)...
call npx orval
popd

:check_desktop_deps
:: 4. Install desktop dependencies
if not exist "desktop" goto :docker_setup
echo.
echo [STEP] Installing desktop dependencies...
pushd "desktop"
call npm install
echo [STEP] Generating Prisma client...
call npx prisma generate
popd

:docker_setup
:: 5. Docker Infrastructure
echo.
echo [STEP] Starting Docker infrastructure (Database and Backend)...
call docker-compose up -d --build

echo.
echo [OK] Setup complete!
echo [TIPS] To start the project:
echo    - Mobile: cd frontend ^&^& npm start
echo    - Desktop: cd desktop ^&^& npm run start
echo    - Backend/DB: Already running (IP: !LOCAL_IP!)
echo.
echo NOTE: This window will stay open. You can close it manually.
echo.
