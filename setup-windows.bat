@echo off
setlocal enabledelayedexpansion

echo 🚀 Starting Massage Salon project setup for Windows...

:: 1. Detect IP and Setup .env files
echo 📝 Setting up environment variables...
set "TEMPLATE=.env-template"

:: Detect local IPv4
set "LOCAL_IP=127.0.0.1"
for /f "usebackq tokens=2 delims=:" %%f in (`ipconfig ^| findstr /c:"IPv4 Address"`) do (
    set "IP_RAW=%%f"
    set "IP_TRIMMED=!IP_RAW: =!"
    :: Save the first non-loopback IP found
    if "!LOCAL_IP!"=="127.0.0.1" set "LOCAL_IP=!IP_TRIMMED!"
)

echo 📍 Local IP detected: !LOCAL_IP!
echo.

if exist "%TEMPLATE%" (
    echo Root: Creating .env with IP !LOCAL_IP!...
    powershell -Command "(gc %TEMPLATE%) -replace '192.168.1.111', '!LOCAL_IP!' | Out-File -encoding utf8 .env"

    if exist "frontend" (
        echo Frontend: Creating .env with IP !LOCAL_IP!...
        powershell -Command "(gc %TEMPLATE%) -replace '192.168.1.111', '!LOCAL_IP!' -replace 'APP_URL', 'EXPO_PUBLIC_API_URL' | Out-File -encoding utf8 frontend/.env"
    )

    if exist "desktop" (
        if not exist "desktop\.env" (
            echo Desktop: Creating .env with DATABASE_URL...
            echo DATABASE_URL="postgresql://admin:supersecret@localhost:5432/massagesalondb?schema=public" > desktop\.env
        )
    )
) else (
    echo ⚠️ Root .env-template not found. Skipping environment setup.
)

:: 2. Install host dependencies
if exist "frontend" (
    echo.
    echo 📦 Installing frontend dependencies...
    pushd "frontend"
    call npm install
    echo 🛠️ Generating API client (Orval)...
    call npx orval
    popd
)

if exist "desktop" (
    echo.
    echo 📦 Installing desktop dependencies...
    pushd "desktop"
    call npm install
    echo 🗄️ Generating Prisma client...
    call npx prisma generate
    popd
)

:: 3. Docker Compose
echo.
echo 🐳 Starting Docker infrastructure (Database ^& Backend)...
call docker-compose up -d --build

echo.
echo ✨ Setup complete!
echo 💡 To start the project:
echo    - Mobile: cd frontend ^&^& npm start
echo    - Desktop: cd desktop ^&^& npm run start
echo    - Backend/DB: Already running in Docker (IP: !LOCAL_IP!)
echo.
pause
