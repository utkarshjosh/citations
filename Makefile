.PHONY: help install dev build up down logs clean test lint format

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install all dependencies
	@echo "Installing backend dependencies..."
	cd backend/scraper && pip install -r requirements.txt
	@echo "Installing API dependencies..."
	cd api && npm install
	@echo "Installing frontend dependencies..."
	cd frontend && npm install
	@echo "✅ All dependencies installed"

dev: ## Start all services in development mode
	docker-compose up

build: ## Build all Docker images
	docker-compose build

up: ## Start all services in detached mode
	docker-compose up -d
	@echo "✅ All services started"
	@echo "Frontend: http://localhost:5173"
	@echo "API: http://localhost:3000"
	@echo "MongoDB: localhost:27017"

down: ## Stop all services
	docker-compose down
	@echo "✅ All services stopped"

logs: ## View logs from all services
	docker-compose logs -f

logs-api: ## View API logs
	docker-compose logs -f api

logs-scraper: ## View scraper logs
	docker-compose logs -f scraper

logs-frontend: ## View frontend logs
	docker-compose logs -f frontend

clean: ## Remove all containers, volumes, and build artifacts
	docker-compose down -v
	rm -rf backend/scraper/__pycache__
	rm -rf backend/scraper/.pytest_cache
	rm -rf api/node_modules
	rm -rf frontend/node_modules
	rm -rf frontend/dist
	@echo "✅ Cleaned up"

test: ## Run all tests
	@echo "Running backend tests..."
	cd backend/scraper && python test_scraper.py
	@echo "Running API tests..."
	cd api && npm test
	@echo "Running frontend tests..."
	cd frontend && npm test

lint: ## Run linters
	@echo "Linting backend..."
	cd backend/scraper && flake8 .
	@echo "Linting API..."
	cd api && npm run lint
	@echo "Linting frontend..."
	cd frontend && npm run lint

format: ## Format code
	@echo "Formatting backend..."
	cd backend/scraper && black .
	@echo "Formatting API..."
	cd api && npm run format
	@echo "Formatting frontend..."
	cd frontend && npm run format
	@echo "✅ Code formatted"

scraper-run: ## Run scraper manually
	cd backend/scraper && python scraper.py

api-dev: ## Run API in development mode
	cd api && npm run dev

frontend-dev: ## Run frontend in development mode
	cd frontend && npm run dev

db-shell: ## Open MongoDB shell
	docker-compose exec mongodb mongosh brain_scroll

db-backup: ## Backup MongoDB database
	docker-compose exec mongodb mongodump --db brain_scroll --out /data/backup
	@echo "✅ Database backed up to MongoDB container /data/backup"

db-restore: ## Restore MongoDB database
	docker-compose exec mongodb mongorestore --db brain_scroll /data/backup/brain_scroll
	@echo "✅ Database restored"
