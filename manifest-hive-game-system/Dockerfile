# Manifest-Hive Game System - Dockerfile
# BRANDING: .T. TogetherSystems - ModularFlux Architecture
# VERSION: 3.0.0
# STANDARD: IBM STANDARD - PERMANENT AKTIV

FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["npm", "start"]


