#!/usr/bin/env bash
set -e

. ./set-env.sh

./run-services.sh

./run-end-to-end-tests.sh

docker-compose down
