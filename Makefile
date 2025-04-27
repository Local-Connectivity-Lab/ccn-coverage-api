# Name of the Docker container
DOCKER_IMAGE=node:22-slim
API_DOCKER_IMAGE_NAME_PREFIX=ghcr.io/local-connectivity-lab
API_DOCKER_IMAGE_NAME=ccn-coverage-api

# The current directory (mapped to the container)
CURRENT_DIR=$(shell pwd)

.PHONY: clean
clean:
	@echo "Clean"
	rm -rf build
	docker volume rm $(docker volume ls -f dangling=true -q)

.PHONY: build
build:
	@echo "Create docker container for $(API_DOCKER_IMAGE_NAME)"
	docker build -t $(API_DOCKER_IMAGE_NAME_PREFIX)/$(API_DOCKER_IMAGE_NAME) .

# The target for development
.PHONY: dev
dev:
	docker run --rm -it \
		-v $(CURRENT_DIR):/app \
		-w /app \
		-p 3000:3000 \
		--network ccn-coverage-api_app-network \
		$(DOCKER_IMAGE) /bin/bash
