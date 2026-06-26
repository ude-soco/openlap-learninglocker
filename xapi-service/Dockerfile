# ---- build stage: compile TypeScript -> dist ----
FROM node:10 AS build
ENV NPM_CONFIG_LOGLEVEL warn
WORKDIR /usr/src/app

COPY package.json yarn.lock ./
RUN yarn install --ignore-engines --frozen-lockfile

COPY . .
RUN yarn build

# ---- runtime stage: production deps + compiled dist ----
FROM node:10
ENV NPM_CONFIG_LOGLEVEL warn
WORKDIR /usr/src/app

COPY package.json yarn.lock ./
RUN yarn install --production --ignore-engines --frozen-lockfile

COPY --from=build /usr/src/app/dist dist

EXPOSE 8081
CMD ["yarn", "start"]
