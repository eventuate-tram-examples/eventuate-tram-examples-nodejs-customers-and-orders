#! /bin/bash -e

docker run -i --rm -v $(pwd):/stuff -e DOCKER_HOST_IP node:12.16.1 bash <<END
cd /stuff
npm install
npm run test:end-to-end
END
