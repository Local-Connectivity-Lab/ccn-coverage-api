# Build stage
FROM node:22-slim AS builder
WORKDIR /usr/src/app

COPY package*.json ./
COPY tsconfig.json ./

RUN npm ci

COPY . .

RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/package*.json ./
RUN npm ci --production && npm cache clean --force
COPY --from=builder /usr/src/app/build ./build
COPY --from=builder /usr/src/app/keys ./keys
EXPOSE 3000

CMD ["node", "build/src/index.js"]