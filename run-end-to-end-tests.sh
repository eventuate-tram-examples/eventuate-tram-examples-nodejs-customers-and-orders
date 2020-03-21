#! /bin/bash -e

docker run -i --rm -v $(pwd)/end-to-end-tests:/end-to-end-tests -e DOCKER_HOST_IP node:12.16.1 bash <<END
cd /end-to-end-tests
npm install
npm run test:end-to-end
END
