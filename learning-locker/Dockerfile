# Learning Locker 2.x — pinned to Node 10 (see .nvmrc).
# The full node:10 image ships build-essential + python2, which node-gyp /
# node-sass need to compile the native dependencies.
FROM node:10

WORKDIR /app

# More headroom for the webpack production builds (UI client in particular).
ENV NODE_OPTIONS=--max-old-space-size=4096

# Install all dependencies first (incl. devDeps — babel-node/webpack are needed
# to build). Do NOT set NODE_ENV=production here or devDeps would be skipped.
# Not using --frozen-lockfile: package.json drops the @google-cloud/* and
# pkgcloud deps (their native grpc addon no longer builds), so the resolved
# tree differs from the committed yarn.lock.
COPY package.json yarn.lock .yarnrc ./
RUN yarn install --ignore-engines

# Copy the rest of the source and build every service.
COPY . .
RUN yarn build-all

# pm2-runtime keeps the process tree in the foreground for containers.
# --ignore-engines: a transitive dep (sax) declares node>=11, but pm2 itself
# runs fine on node 10.
RUN yarn global add pm2@4.3.0 --ignore-engines

# Created at build time so pm2 log/pid paths exist.
RUN mkdir -p logs pids

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3000 8080

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["pm2-runtime", "start", "pm2/all.json"]
