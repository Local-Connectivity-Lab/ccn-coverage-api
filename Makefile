# Name of the Docker container
DOCKER_IMAGE=node:22-slim
API_DOCKER_IMAGE_NAME=ccn-coverage-api

# The current directory (mapped to the container)
CURRENT_DIR=$(shell pwd)

.PHONY: clean
clean:
	@echo "Clean"
	rm -rf build
	docker volume rm $(docker volume ls -f dangling=true -q)

# Validate semantic version format
validate-semver-%:
	@echo "Validating version format: $*"
	@if ! echo "$*" | grep -E '^[0-9]+\.[0-9]+\.[0-9]+$$' > /dev/null; then \
		echo "Error: Version must be in semantic version format (e.g., 1.2.3)"; \
		exit 1; \
	fi

.PHONY: build
build:
	@echo "Create docker container for $(API_DOCKER_IMAGE_NAME)"
	docker build -t $(API_DOCKER_IMAGE_NAME) .


# Build with specific version (e.g., make build-1.2.3)
build-%: validate-semver-%
	@echo "Create docker container for $(API_DOCKER_IMAGE_NAME) with version $*"
	docker build -t $(API_DOCKER_IMAGE_NAME):$* .

# Publish to Docker registry (e.g., make publish VERSION=1.2.3)
.PHONY: publish
publish: validate-semver-$(VERSION)
	@echo "Building and publishing $(API_DOCKER_IMAGE_NAME):$(VERSION)"
	docker build -t $(API_DOCKER_IMAGE_NAME):$(VERSION) .
	docker tag $(API_DOCKER_IMAGE_NAME):$(VERSION) icr.infra.seattlecommunitynetwork.org/$(API_DOCKER_IMAGE_NAME):$(VERSION)
	docker tag $(API_DOCKER_IMAGE_NAME):$(VERSION) icr.infra.seattlecommunitynetwork.org/$(API_DOCKER_IMAGE_NAME):latest
	docker push icr.infra.seattlecommunitynetwork.org/$(API_DOCKER_IMAGE_NAME):$(VERSION)
	docker push icr.infra.seattlecommunitynetwork.org/$(API_DOCKER_IMAGE_NAME):latest
	@echo "Successfully published $(API_DOCKER_IMAGE_NAME):$(VERSION) to registry"

# The target for development
.PHONY: dev
dev:
	docker run --rm -it \
		-v $(CURRENT_DIR):/app \
		-w /app \
		-p 3000:3000 \
		$(DOCKER_IMAGE) /bin/bash