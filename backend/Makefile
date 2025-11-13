.PHONY: help build run test clean docker-up docker-down migrate seed

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build: ## Build the application
	go build -o bin/app cmd/app/main.go

run: ## Run the application
	go run cmd/app/main.go

test: ## Run tests
	go test -v -race -coverprofile=coverage.out ./...
	go tool cover -html=coverage.out -o coverage.html

clean: ## Clean build artifacts
	rm -rf bin/
	rm -f coverage.out coverage.html

docker-up: ## Start all services with Docker Compose
	docker-compose up -d

docker-down: ## Stop all services
	docker-compose down

docker-logs: ## Show logs
	docker-compose logs -f app

docker-rebuild: ## Rebuild and restart services
	docker-compose down
	docker-compose build --no-cache
	docker-compose up -d

deps: ## Download dependencies
	go mod download
	go mod tidy

fmt: ## Format code
	go fmt ./...
	gofmt -s -w .

lint: ## Run linter
	golangci-lint run

migrate: ## Run database migrations
#	@echo "Running MongoDB migrations..."
#	mongosh "mongodb://admin:password@localhost:27017/admin" --eval "load('./migrations/mongodb/init.js')"
	@echo "Running MongoDB migrations..."
	@docker exec ecommerce-mongodb mongosh \
		--username admin \
		--password password \
		--authenticationDatabase admin \
		--file /docker-entrypoint-initdb.d/init.js

seed: ## Seed database with sample data
	@echo "Seeding database..."
	go run ./scripts/seed/main.go

install-tools: ## Install development tools
	go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest

# Development commands
dev: docker-up ## Start development environment
	@echo "Waiting for services to be ready..."
	@timeout 10
	@make run

dev-down: docker-down ## Stop development environment

# Database commands
db-shell-mongo: ## Open MongoDB shell
	docker exec -it ecommerce-mongodb mongosh -u admin -p password ecommerce

db-shell-redis: ## Open Redis CLI
	docker exec -it ecommerce-redis redis-cli

db-shell-neo4j: ## Open Neo4j browser (http://localhost:7474)
	@echo "Open http://localhost:7474 in your browser"
	@echo "Username: neo4j"
	@echo "Password: password"

# Testing specific databases
test-mongodb: ## Test MongoDB connection
	@echo "Testing MongoDB connection..."
	docker exec ecommerce-mongodb mongosh --eval "db.adminCommand('ping')"

test-redis: ## Test Redis connection
	@echo "Testing Redis connection..."
	docker exec ecommerce-redis redis-cli ping

test-neo4j: ## Test Neo4j connection
	@echo "Testing Neo4j connection..."
	curl -u neo4j:password http://localhost:7474/db/data/