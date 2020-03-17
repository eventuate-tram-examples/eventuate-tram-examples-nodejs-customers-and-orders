#!/usr/bin/env bash

export EVENTUATE_COMMON_VERSION=0.8.0.RELEASE
export EVENTUATE_KAFKA_VERSION=0.3.0.RELEASE
export EVENTUATE_CDC_VERSION=0.6.0.RC1
export EVENTUATE_CDC_KAFKA_ENABLE_BATCH_PROCESSING=false

docker-compose up -d zookeeper kafka mysql mongodb cdcservice
./wait-for-services.sh $DOCKER_HOST_IP "8099"
docker-compose up -d customerservice orderhistoryservice orderservice
./wait-for-services.sh $DOCKER_HOST_IP "8081 8082 8083"

npm run test:end-to-end

docker-compose down