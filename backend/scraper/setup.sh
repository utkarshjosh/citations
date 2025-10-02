#!/bin/bash

# Brain Scroll Scraper Setup Script

echo "=================================="
echo "Brain Scroll Scraper Setup"
echo "=================================="

# Check if uv is installed
echo "Checking uv installation..."
if ! command -v uv &> /dev/null; then
    echo "Error: uv is not installed"
    echo "Install it with: curl -LsSf https://astral.sh/uv/install.sh | sh"
    exit 1
fi

echo "✓ uv is installed"

# Sync dependencies using uv with existing .venv
echo ""
echo "Syncing dependencies with uv..."
uv sync

if [ $? -ne 0 ]; then
    echo "Error: Failed to sync dependencies"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "✓ .env file created. Please edit it with your MongoDB connection string."
else
    echo ""
    echo "✓ .env file already exists"
fi

echo ""
echo "=================================="
echo "Setup Complete!"
echo "=================================="
echo ""
echo "Next steps:"
echo "1. Edit .env file with your MongoDB connection string"
echo "2. Activate virtual environment: source .venv/bin/activate"
echo "3. Run tests: uv run python test_scraper.py"
echo "4. Run scraper: uv run python scraper.py"
echo ""
