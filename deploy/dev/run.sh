#! /bin/bash
OLD_CONTAINER="$(docker ps --all --quiet --filter=name="DOCKER_CONTAINER_NAME")"

if [ -n "$OLD_CONTAINER" ]; then
    if docker inspect -f '{{.State.Running}}' "$OLD_CONTAINER" 2>/dev/null; then
        echo "Stopping and removing old container: ${DOCKER_CONTAINER_NAME}"
            docker stop "$OLD_CONTAINER" && sudo docker rm "$OLD_CONTAINER"
    else
        echo "Old container exists but is not running: ${DOCKER_CONTAINER_NAME}"
    fi
fi

docker stack deploy --compose-file docker-compose.yml --with-registry-auth sukimoko-api-dev
echo "Deploying new container: ${DOCKER_CONTAINER_NAME}"
