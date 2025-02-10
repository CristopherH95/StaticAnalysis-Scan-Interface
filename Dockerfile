ARG NODE_VERSION=22.10.0
ARG SEMGREP_SHA=b616773

FROM docker.io/library/node:${NODE_VERSION}-alpine AS node

FROM docker.io/semgrep/semgrep:sha-${SEMGREP_SHA}

COPY --from=node /usr/lib /usr/lib
COPY --from=node /usr/local/lib /usr/local/lib
COPY --from=node /usr/local/include /usr/local/include
COPY --from=node /usr/local/bin /usr/local/bin

RUN mkdir /scanner && mkdir /scanner/src
WORKDIR /scanner
COPY package.json package.json
COPY package-lock.json package-lock.json
COPY eslintrc.js eslintrc.js

RUN npm install && npm run build

COPY dist/ /scanner/src