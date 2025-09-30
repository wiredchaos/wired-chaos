@echo off
REM 🚀 WIRED CHAOS Auto-Launcher
REM One-click automation for complete security remediation

echo.
echo ========================================
echo   WIRED CHAOS AUTO-LAUNCHER
echo   Complete Security Automation  
echo ========================================
echo.

REM Check if PowerShell is available
powershell -Command "Write-Host 'PowerShell available - starting automation...' -ForegroundColor Green"
if errorlevel 1 (
    echo ERROR: PowerShell not available
    pause
    exit /b 1
)

REM Run the master automation script
powershell -ExecutionPolicy Bypass -File "RUN_MASTER_AUTOMATION.ps1" -ForceInstall

echo.
echo ========================================
echo   AUTOMATION COMPLETE
echo ========================================
pause