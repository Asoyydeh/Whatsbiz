# 09_DEPLOYMENT_CI_CD_PRODUCTION.md

# WhatsBiz CRM — Deployment & CI/CD Architecture

---

# DEPLOYMENT OVERVIEW

This system is designed for:

* Production SaaS deployment
* Horizontal scaling
* Multi-environment support (dev, staging, production)
* Zero-downtime deployment

---

# ENVIRONMENT STRUCTURE

## Environments

* Development (local)
* Staging (testing)
* Production (live system)

---

## ENV FILE STRUCTURE

```
.env.development
.env.staging
.env.production
```

---

# INFRASTRUCTURE STACK

## Core Services

* Frontend: Next.js
* Backend: NestJS
* Database: PostgreSQL
* Cache: Redis
* Queue: BullMQ
* Realtime: Socket.IO
* Reverse Proxy: Nginx
* Storage: MinIO / S3

---

# CONTAINERIZATION

## Docker Strategy

Every service must be containerized.

---

## BACKEND DOCKERFILE

```dockerfile id="d1p8xk"
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
```

---

## FRONTEND DOCKERFILE

```dockerfile id="f9x2ld"
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

---

## DOCKER COMPOSE

```yaml id="c0m8kq"
version: "3.9"

services:
  backend:
    build: ./backend
    ports:
      - "3001:3000"
    env_file:
      - .env.production
    depends_on:
      - postgres
      - redis

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"

  postgres:
    image: postgres:15
    restart: always
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: admin
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7
    restart: always
    ports:
      - "6379:6379"

volumes:
  pgdata:
```

---

# NGINX REVERSE PROXY

```nginx id="n7x3lp"
server {
  listen 80;

  server_name api.whatsbiz.local;

  location / {
    proxy_pass http://backend:3000;
  }
}
```

---

# CI/CD PIPELINE

## GitHub Actions Workflow

```yaml id="g4h9qs"
name: Deploy WhatsBiz CRM

on:
  push:
    branches:
      - main

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm install

      - name: Run tests
        run: npm run test

      - name: Build project
        run: npm run build

      - name: Build Docker images
        run: docker build -t whasbiz-backend ./backend

      - name: Deploy to server
        run: |
          ssh ubuntu@server "
            cd /app &&
            git pull &&
            docker compose down &&
            docker compose up -d --build
          "
```

---

# DEPLOYMENT STRATEGY

## Zero Downtime Deployment

Steps:

1. Build new container
2. Start new instance
3. Health check
4. Switch traffic
5. Stop old instance

---

# DATABASE DEPLOYMENT

## Migration Strategy

Prisma Migrations:

```bash
npx prisma migrate deploy
```

---

## SAFETY RULE

NEVER run destructive migrations in production without backup.

---

# SCALING ARCHITECTURE

## Phase 1 (MVP)

* Single VPS
* Docker Compose
* Nginx reverse proxy

---

## Phase 2 (Growth)

* Load balancer
* 2+ backend instances
* Separate Redis server

---

## Phase 3 (Scale)

* Kubernetes cluster
* Horizontal pod autoscaling
* Managed PostgreSQL

---

## Phase 4 (Enterprise)

* Multi-region deployment
* CDN global distribution
* Read replicas database

---

# MONITORING STACK

## Tools

* Prometheus (metrics)
* Grafana (dashboard)
* Loki (logs)
* Node Exporter

---

## METRICS

* API response time
* Error rate
* Queue processing time
* Active users
* Webhook latency

---

# LOGGING STRATEGY

## Rules

* No sensitive data in logs
* Structured JSON logging
* Centralized logging system

---

## LOG FORMAT

```json id="l0g9x2"
{
  "timestamp": "2026-06-25T10:00:00Z",
  "level": "INFO",
  "service": "backend",
  "message": "Message sent",
  "tenant_id": "uuid",
  "user_id": "uuid"
}
```

---

# BACKUP STRATEGY

## Database Backup

* Daily automatic backup
* Retention: 30 days
* Encrypted storage

---

## Storage Backup

* S3 snapshot
* Versioning enabled

---

# DISASTER RECOVERY

## RPO

15 minutes

## RTO

1 hour

---

# HEALTH CHECK SYSTEM

Endpoints:

```
/health
/health/db
/health/redis
/health/queue
```

---

# AUTO SCALING RULES

Scale when:

* CPU > 70%
* Queue backlog > 1000 jobs
* Response time > 500ms

---

# SECURITY IN DEPLOYMENT

* HTTPS enforced (TLS 1.3)
* Environment secrets stored in vault
* No secrets in Git
* Firewall enabled
* SSH key only access

---

# RELEASE FLOW

1. Push to main
2. CI runs tests
3. Build Docker image
4. Deploy to staging
5. Run smoke test
6. Deploy to production

---

# PRODUCTION CHECKLIST

Before release:

* [ ] Database migration tested
* [ ] Redis connected
* [ ] Webhook verified
* [ ] Socket.IO working
* [ ] Queue workers running
* [ ] Monitoring active
* [ ] Backup enabled
* [ ] SSL active
* [ ] Load test passed

---

# FINAL GOAL

System must be able to:

* Handle 10M+ messages
* Run without downtime
* Recover from failure automatically
* Scale horizontally
* Maintain tenant isolation under load
