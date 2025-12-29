FROM node:22.21.1-alpine AS base
WORKDIR /usr/src/wpp-server
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Install build dependencies and runtime libraries for sharp
RUN apk update && \
    apk add --no-cache \
    vips \
    vips-dev \
    fftw-dev \
    gcc \
    g++ \
    make \
    libc6-compat \
    pkgconfig \
    python3 \
    && rm -rf /var/cache/apk/*

# To make sure yarn 4 uses node-modules linker
COPY .yarnrc.yml ./

# Copy only package.json to leverage Docker cache
COPY package.json ./
COPY yarn.lock ./

# Enable corepack and prepare yarn 4.12.0
RUN corepack enable && \
    corepack prepare yarn@4.12.0 --activate

# Install dependencies with immutable lockfile
RUN yarn install --immutable

FROM base AS build
WORKDIR /usr/src/wpp-server
COPY . .
RUN yarn install
RUN yarn build

FROM build AS runtime
WORKDIR /usr/src/wpp-server/

# Install runtime dependencies (chromium, vips, and PM2)
RUN apk add --no-cache \
    chromium \
    vips \
    fftw && \
    npm install -g pm2

# Copy PM2 ecosystem config
COPY ecosystem.config.js ./

# Copy and set up entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 21465
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["pm2-runtime", "start", "ecosystem.config.js"]
