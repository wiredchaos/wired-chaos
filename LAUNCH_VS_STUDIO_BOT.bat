@echo off
REM WIRED CHAOS VS Studio Bot Automation Launcher
REM Quick launcher for GitHub Issue #2: https://github.com/wiredchaos/wired-chaos/issues/2

echo ========================================
echo   WIRED CHAOS VS STUDIO BOT LAUNCHER
echo   GitHub Issue #2 Automation
echo ========================================
echo.

REM Check if PowerShell is available
where powershell >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: PowerShell not found!
    echo Please install PowerShell and try again.
    pause
    exit /b 1
)

echo Starting VS Studio Bot Automation...
echo.

REM Run the PowerShell automation script
powershell.exe -ExecutionPolicy Bypass -File "VS_STUDIO_BOT_AUTOMATION.ps1"

echo.
echo ========================================
echo   VS STUDIO BOT AUTOMATION COMPLETE
echo ========================================
echo.
echo Check the following files for results:
echo   - deployment.log
echo   - VS_STUDIO_BOT_REPORT.md
echo   - GitHub Actions: https://github.com/wiredchaos/wired-chaos/actions
echo.
pause