#!/bin/bash

# Brain Scroll Setup Script
# This script helps set up the development environment

set -e

echo "🧠 Brain Scroll Setup"
echo "===================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    echo "Please install Docker from https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    echo "Please install Docker Compose from https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✅ Docker and Docker Compose are installed${NC}"
echo ""

# Create .env files from examples
echo "📝 Creating environment files..."

if [ ! -f ".env" ]; then
    cp .env.example .env
    echo -e "${GREEN}✅ Created root .env${NC}"
else
    echo -e "${YELLOW}⚠️  Root .env already exists${NC}"
fi

if [ ! -f "backend/scraper/.env" ]; then
    cp backend/scraper/.env.example backend/scraper/.env
    echo -e "${GREEN}✅ Created backend/scraper/.env${NC}"
else
    echo -e "${YELLOW}⚠️  backend/scraper/.env already exists${NC}"
fi

if [ ! -f "api/.env" ]; then
    cp api/.env.example api/.env
    echo -e "${GREEN}✅ Created api/.env${NC}"
else
    echo -e "${YELLOW}⚠️  api/.env already exists${NC}"
fi

if [ ! -f "frontend/.env" ]; then
    cp frontend/.env.example frontend/.env
    echo -e "${GREEN}✅ Created frontend/.env${NC}"
else
    echo -e "${YELLOW}⚠️  frontend/.env already exists${NC}"
fi

echo ""
echo "⚙️  Configuration"
echo "================"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: You need to configure API keys!${NC}"
echo ""
echo "Edit backend/scraper/.env and add:"
echo "  - GEMINI_API_KEY (required)"
echo "  - GROQ_API_KEY (optional fallback)"
echo ""
read -p "Press Enter to continue after configuring API keys..."

echo ""
echo "🐳 Starting Docker services..."
echo ""

# Build and start services
docker-compose up -d --build

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "Services are running:"
echo "  - Frontend: http://localhost:5173"
echo "  - API: http://localhost:3000"
echo "  - MongoDB: localhost:27017"
echo ""
echo "Useful commands:"
echo "  - View logs: docker-compose logs -f"
echo "  - Stop services: docker-compose down"
echo "  - Restart services: docker-compose restart"
echo "  - Run scraper: make scraper-run"
echo ""
echo "For more commands, run: make help"
echo ""
echo "Happy coding! 🚀"
