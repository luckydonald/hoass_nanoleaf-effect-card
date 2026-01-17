# Is this a frontend or backend project, or both?
# Set explicit (e.g. by `make lint FRONTEND=1 BACKEND=1`), or let the
# defaults detect the presence of the directories.
FRONTEND ?= $(if $(wildcard frontend),1,0)
BACKEND  ?= $(if $(wildcard custom_components),1,0)

.PHONY: release lint format build setup help commit

help:
	@echo "HomeAssistant-plugin - Development Commands"
	@echo ""
	@echo "Usage: make <target> [FRONTEND=1] [BACKEND=1]"
	@echo ""
	@echo "Targets:"
	@echo "  setup          - Set up the full development environment (frontend + backend)"
	@echo "  setup-ts       - Set up frontend development environment (TypeScript)"
	@echo "  setup-py       - Set up backend  development environment (Python)"
	@echo "  lint           - Run all linters (frontend + backend)"
	@echo "  lint-ts        - Lint/type‑check TypeScript only"
	@echo "  lint-py        - Lint/format Python only"
	@echo "  format         - Format all code (frontend + backend)"
	@echo "  format-ts      - Format TypeScript only"
	@echo "  format-py      - Format Python only"
	@echo "  build          - Build what needs to be build"
	@echo "  build-ts       - Build frontend"
	@echo "  commit         - Commit changes with structured messages"
	@echo "  release        - Bump version, lint, build, and push release"
	@echo "  help           - Show this help message"

setup: setup-backend setup-frontend

setup-backend:
ifeq ($(BACKEND),1)
	@echo "Setting up Python development environment..."
	uv sync
else
	@echo "No Python sources detected – skipping backend setup."
endif

setup-frontend:
ifeq ($(FRONTEND),1)
	@echo "Setting up frontend development environment..."
	cd frontend && yarn install
else
	@echo "No frontend sources detected – skipping frontend setup."
endif

lint: lint-py lint-ts

lint-py:
ifeq ($(BACKEND),1)
	@echo "Linting Python..."
	uv run ruff check custom_components/
	uv run ruff format --check custom_components/
else
	@echo "No Python sources detected – skipping backend lint."
endif

lint-ts:
ifeq ($(FRONTEND),1)
	@echo "Type checking frontend..."
	cd frontend && yarn type-check
else
	@echo "No frontend sources detected – skipping TypeScript lint."
endif

format: format-py format-ts

format-py:
ifeq ($(BACKEND),1)
	@echo "Formatting Python..."
	uv run ruff format custom_components/
	uv run ruff check --fix custom_components/ || true
else
	@echo "No Python sources detected – skipping backend format."
endif

format-ts:
ifeq ($(FRONTEND),1)
	@echo "Formatting TypeScript..."
	cd frontend && yarn format
else
	@echo "No frontend sources detected – skipping TypeScript format."
endif

build: build-frontend

build-frontend:
ifeq ($(FRONTEND),1)
	@echo "Building frontend..."
	cd frontend && yarn install && yarn build
else
	@echo "No frontend sources detected – skipping build."
endif

commit:
	@chmod +x scripts/commit.sh
	@./scripts/commit.sh

release:
	@chmod +x scripts/release.sh
	@./scripts/release.sh

