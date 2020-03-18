#!/usr/bin/env bash
set -e

./run-services.sh

npm run test:end-to-end

docker-compose down