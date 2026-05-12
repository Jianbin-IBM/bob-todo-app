@echo off
REM Script to run tests with coverage on Windows

echo ==========================================
echo Running Todo API Tests with Coverage
echo ==========================================
echo.

REM Activate virtual environment if it exists
if exist venv\Scripts\activate.bat (
    echo Activating virtual environment...
    call venv\Scripts\activate.bat
)

REM Check if pytest is installed
where pytest >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: pytest is not installed
    echo Please run: pip install -r requirements.txt
    exit /b 1
)

REM Run tests with coverage
echo Running tests...
echo.
pytest

REM Check if tests passed
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ==========================================
    echo All tests passed!
    echo ==========================================
    echo.
    echo Coverage report generated in htmlcov\index.html
    echo Open it with: start htmlcov\index.html
) else (
    echo.
    echo ==========================================
    echo Some tests failed
    echo ==========================================
    exit /b 1
)

@REM Made with Bob
