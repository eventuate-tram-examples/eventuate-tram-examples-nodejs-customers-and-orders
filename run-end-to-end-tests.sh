#! /bin/bash -e

docker run -i --rm -v $(pwd):/tests -e DOCKER_HOST_IP node:12.16.1 bash <<END
cd /tests
npm install
npm run test:end-to-end
END
