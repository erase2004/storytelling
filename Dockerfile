# https://docs.docker.com/samples/library/node/
ARG NODE_VERSION=16.14.2
# https://github.com/Yelp/dumb-init/releases
ARG DUMB_INIT_VERSION=1.2.2

# Build container
FROM node:${NODE_VERSION}-alpine AS build
ARG DUMB_INIT_VERSION
WORKDIR /build

RUN apk add --no-cache build-base python2 yarn && \
    wget -O dumb-init -q https://github.com/Yelp/dumb-init/releases/download/v${DUMB_INIT_VERSION}/dumb-init_${DUMB_INIT_VERSION}_amd64 && \
    chmod +x dumb-init 
ADD . /build
RUN mkdir tmp_pic
RUN yarn install
RUN yarn build && yarn cache clean

# Runtime container
FROM node:${NODE_VERSION}-alpine
RUN apk add imagemagick graphicsmagick ffmpeg
WORKDIR /app
COPY ./public /build/public
COPY --from=build /build /app

EXPOSE 3000
CMD ["./dumb-init", "yarn", "start"]