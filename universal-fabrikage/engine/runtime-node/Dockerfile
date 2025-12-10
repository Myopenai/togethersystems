# Engine Node Runtime - Dockerfile
# BRANDING: .T. TogetherSystems - ModularFlux Architecture
# VERSION: 3.0.0

FROM node:18-alpine

WORKDIR /app

COPY package.json ./
RUN npm ci

COPY . .

ENV PORT=8080
EXPOSE 8080

CMD ["node", "server.js"]


