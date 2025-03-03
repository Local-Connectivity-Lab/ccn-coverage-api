# Makefile for dev target to run the latest Deno container

# Name of the Docker container
DOCKER_IMAGE=node:22-slim

# The current directory (mapped to the container)
CURRENT_DIR=$(shell pwd)


clean:
	echo "Clean"

assemble:
	echo "create docker container"



# The target for development
dev:
	docker run --rm -it \
		-v $(CURRENT_DIR):/app \
		-w /app \
		$(DOCKER_IMAGE) /bin/bash
