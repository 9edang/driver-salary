.SILENT:

-include .env

setup-directory:
	mkdir -p bin

setup-migration-linux: setup-directory
	@echo "====== Downloading migration tool"
	curl -sS -L https://github.com/golang-migrate/migrate/releases/download/v4.17.0/migrate.linux-amd64.tar.gz | tar -C ${PWD}/bin -xz migrate

migrate-create: ## Create Migration File
	./bin/migrate create -ext sql -dir "${PWD}/migration" -seq ${name}

migrate-up: ## Run Up Migration
	./bin/migrate -path migration -database "${DB_URL}" up

migrate-force:
	./bin/migrate -path migration -database "${DB_URL}" force

migrate-down: ## Run Down Migration
	./bin/migrate -path migration -database "${DB_URL}" down