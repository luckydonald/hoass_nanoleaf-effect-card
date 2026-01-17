.PHONY: release lint format build setup help commit

help:
	@echo "Calendar Alarm Clock - Development Commands"
	@echo ""
	@echo "Usage: make <target>"
	@echo ""
	@echo "Targets:"
	@echo "  setup     - Set up development environment"
	@echo "  lint      - Run all linters"
	@echo "  format    - Format all code"
	@echo "  build     - Build frontend"
	@echo "  commit    - Commit changes with structured messages"
	@echo "  release   - Bump version, lint, build, and push release"
	@echo "  help      - Show this help message"

setup:
	@echo "Setting up development environment..."
	uv sync
	cd frontend && yarn install
	@echo "Done!"

lint:
	@echo "Linting Python..."
	uv run ruff check custom_components/
	uv run ruff format --check custom_components/
	@echo "Type checking frontend..."
	cd frontend && yarn type-check

format:
	@echo "Formatting Python..."
	uv run ruff format custom_components/
	uv run ruff check --fix custom_components/ || true
	@echo "Formatting TypeScript..."
	cd frontend && yarn format

build:
	@echo "Building frontend..."
	cd frontend && yarn install && yarn build

commit:
	@chmod +x scripts/commit.sh
	@./scripts/commit.sh

release:
	@chmod +x scripts/release.sh
	@./scripts/release.sh

