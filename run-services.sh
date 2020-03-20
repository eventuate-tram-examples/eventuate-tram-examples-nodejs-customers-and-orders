#!/usr/bin/env bash
set -e

docker-compose up -d zookeeper kafka mysql mongodb cdcservice
./wait-for-services.sh ${DOCKER_HOST_IP?} "8099"
docker-compose up -d --build customer-service order-history-service order-service
./wait-for-services.sh ${DOCKER_HOST_IP?} "8081 8082 8083"
