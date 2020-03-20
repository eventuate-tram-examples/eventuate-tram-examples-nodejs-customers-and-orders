#!/usr/bin/env bash
set -e

. ./set-env.sh

./run-services.sh

npm run test:end-to-end

docker-compose down
