# Name of the Docker container
DOCKER_IMAGE=node:22-slim

# The current directory (mapped to the container)
CURRENT_DIR=$(shell pwd)

.PHONY: clean
clean:
	@echo "Clean"
	rm -rf build
	docker volume rm ccn-coverage-api_mongo-data-db ccn-coverage-api_mongo-data-configdb

.PHONY: build
build:
	@echo "Create docker container"
	docker build -t ccn-coverage-api .

# The target for development
.PHONY: dev
dev:
	docker run --rm -it \
		-v $(CURRENT_DIR):/app \
		-w /app \
		$(DOCKER_IMAGE) /bin/bash
