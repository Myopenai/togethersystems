// Docker Deployer - Generiert Docker-Konfigurationen
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0

import { Plan } from '../formula_selector';
import { Intent } from '../prompt_parser';

export function generateDocker(plan: Plan, intent: Intent, language: 'python' | 'node' | 'rust' | 'go' = 'python'): { dockerfile: string; dockerCompose: string } {
  const dockerfile = generateDockerfile(plan, intent, language);
  const dockerCompose = generateDockerCompose(plan, intent, language);

  return { dockerfile, dockerCompose };
}

function generateDockerfile(plan: Plan, intent: Intent, language: string): string {
  switch (language) {
    case 'python':
      return `# Dockerfile for ${plan.category}
# BRANDING: .T. TogetherSystems - ModularFlux Architecture
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PORT=8080
EXPOSE 8080

CMD ["python", "program.py"]`;

    case 'node':
      return `# Dockerfile for ${plan.category}
# BRANDING: .T. TogetherSystems - ModularFlux Architecture
FROM node:18-alpine

WORKDIR /app

COPY package.json .
RUN npm ci --production

COPY . .

ENV PORT=8080
EXPOSE 8080

CMD ["node", "program.js"]`;

    case 'rust':
      return `# Dockerfile for ${plan.category}
# BRANDING: .T. TogetherSystems - ModularFlux Architecture
FROM rust:1.75 as builder

WORKDIR /app
COPY . .
RUN cargo build --release

FROM debian:bookworm-slim
COPY --from=builder /app/target/release/program /usr/local/bin/
CMD ["program"]`;

    case 'go':
      return `# Dockerfile for ${plan.category}
# BRANDING: .T. TogetherSystems - ModularFlux Architecture
FROM golang:1.21-alpine AS builder

WORKDIR /app
COPY . .
RUN go build -o program .

FROM alpine:latest
COPY --from=builder /app/program /usr/local/bin/
CMD ["program"]`;

    default:
      return `# Dockerfile for ${plan.category}
FROM alpine:latest
WORKDIR /app
COPY . .
CMD ["./program"]`;
  }
}

function generateDockerCompose(plan: Plan, intent: Intent, language: string): string {
  const serviceName = plan.category.toLowerCase().replace(/\s+/g, '-');
  
  return `version: '3.8'

services:
  ${serviceName}:
    build: .
    ports:
      - "8080:8080"
    environment:
      - PORT=8080
    networks:
      - universal

networks:
  universal:
    driver: bridge`;
}

module.exports = { generateDocker };


