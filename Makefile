.PHONY: install setup run run-backend run-frontend test lint clean

# Install all dependencies
install: install-backend install-frontend

install-backend:
	cd backend && python -m venv .venv && . .venv/bin/activate && pip install -r ../requirements.txt

install-frontend:
	cd frontend && npm install

# Full setup from scratch
setup: clean install

# Run both backend and frontend in parallel
run:
	@trap 'kill 0' EXIT; \
	(make run-backend) & \
	(make run-frontend) & \
	wait

run-backend:
	cd backend && . .venv/bin/activate && uvicorn api.index:app --reload --port 8000 --app-dir ..

run-frontend:
	cd frontend && npm run dev

# Test
test: test-backend test-frontend

test-backend:
	cd backend && . .venv/bin/activate && cd .. && python -m pytest tests/ -v

test-frontend:
	cd frontend && npx tsc --noEmit

# Lint
lint: lint-backend lint-frontend

lint-backend:
	ruff check . && ruff format --check .

lint-frontend:
	cd frontend && npx tsc --noEmit

# Clean everything
clean:
	rm -rf backend/.venv
	rm -rf frontend/node_modules frontend/dist
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true
