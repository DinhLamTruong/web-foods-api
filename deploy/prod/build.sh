#! /bin/sh
docker --version
docker build -f Dockerfile -t ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG} . --network host
docker image ls
echo "...[done] build image "$DOCKER_IMAGER_NAME:$DOCKER_IMAGE_TAG""
