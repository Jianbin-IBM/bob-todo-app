#!/bin/bash
# Script to run tests with coverage

echo "=========================================="
echo "Running Todo API Tests with Coverage"
echo "=========================================="
echo ""

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    echo "Activating virtual environment..."
    source venv/bin/activate
fi

# Check if pytest is installed
if ! command -v pytest &> /dev/null; then
    echo "Error: pytest is not installed"
    echo "Please run: pip install -r requirements.txt"
    exit 1
fi

# Run tests with coverage
echo "Running tests..."
echo ""
pytest

# Check if tests passed
if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "✅ All tests passed!"
    echo "=========================================="
    echo ""
    echo "Coverage report generated in htmlcov/index.html"
    echo "Open it with: open htmlcov/index.html (macOS) or xdg-open htmlcov/index.html (Linux)"
else
    echo ""
    echo "=========================================="
    echo "❌ Some tests failed"
    echo "=========================================="
    exit 1
fi

# Made with Bob
