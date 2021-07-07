# Makefile
DOCKER_CONTEXT := app
IMAGE_NAME := point-app
JWT_SECRET=pointappsecret

default: build run

.PHONY: build
build:
	@echo Building $(IMAGE_NAME)
	@docker build -t $(IMAGE_NAME) -f Dockerfile $(DOCKER_CONTEXT)

.PHONY: run
run: build
	@echo "Running $(IMAGE_NAME)"
	@docker run \
		-it --rm \
		-e JWT_SECRET=$(JWT_SECRET) \
		-p "4000:4000" \
		$(IMAGE_NAME)

.PHONY: run-shell
run-shell: build
	@docker run -it --rm $(IMAGE_NAME) /bin/sh
