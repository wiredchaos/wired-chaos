@echo off
REM 🤖 WIRED CHAOS VS Studio Bot Setup - Windows Batch Launcher
REM Quick launcher for VS Studio Bot Setup automation

echo 🤖 WIRED CHAOS VS Studio Bot Setup Launcher
echo ============================================
echo.

REM Check if PowerShell is available
powershell -Command "Get-Host" >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ PowerShell is not available or not in PATH
    echo Please ensure PowerShell is installed and accessible
    pause
    exit /b 1
)

REM Check if we're in the right directory
if not exist "VS_STUDIO_BOT_SETUP.ps1" (
    echo ❌ VS_STUDIO_BOT_SETUP.ps1 not found in current directory
    echo Please run this from the WIRED CHAOS repository root
    pause
    exit /b 1
)

echo ✅ PowerShell available
echo ✅ Setup script found
echo.

REM Prompt for execution options
echo Select execution mode:
echo [1] Full automation (recommended)
echo [2] Interactive mode with confirmations
echo [3] Quick mode (skip confirmations)
echo [4] Skip secrets setup
echo [5] Development mode (skip tests)
echo.

set /p choice="Enter your choice (1-5): "

REM Set PowerShell parameters based on choice
set "ps_params="
if "%choice%"=="1" set "ps_params="
if "%choice%"=="2" set "ps_params="
if "%choice%"=="3" set "ps_params=-SkipConfirmation"
if "%choice%"=="4" set "ps_params=-SkipConfirmation -SkipSecrets"
if "%choice%"=="5" set "ps_params=-SkipConfirmation -SkipTests"

if "%choice%"=="" set "ps_params="
if not defined ps_params (
    echo Invalid choice, using default full automation
    set "ps_params="
)

echo.
echo 🚀 Starting VS Studio Bot Setup...
echo Parameters: %ps_params%
echo.

REM Execute the PowerShell script
powershell -ExecutionPolicy Bypass -File "VS_STUDIO_BOT_SETUP.ps1" %ps_params%

REM Check exit code
if %errorlevel% equ 0 (
    echo.
    echo ✅ VS Studio Bot Setup completed successfully!
    echo Check deployment_logs.txt for detailed logs
) else (
    echo.
    echo ❌ VS Studio Bot Setup completed with errors
    echo Check deployment_logs.txt for troubleshooting
)

echo.
echo Press any key to exit...
pause >nul