## --- Base stage ---
FROM node:18-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

## --- Dependencies stage ---
FROM base AS deps
RUN apk add --no-cache libc6-compat python3 make g++
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && cp -r node_modules /prod_node_modules

## --- Builder stage (for Prisma, docs, etc.) ---
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Génère client Prisma
RUN npx prisma generate

## --- Runtime stage ---
FROM base AS runner
WORKDIR /app
# Utiliser deps préinstallées
COPY --from=deps /prod_node_modules ./node_modules
# Copie du code
COPY --from=builder /app .

# Variables par défaut (peuvent être surchargées)
ENV PORT=3000
ENV NODE_ENV=production

# Healthcheck simple (ping metrics ou health)
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:${PORT}/api/health || exit 1

# Expose port
EXPOSE 3000

# Démarrage: exécute migrations puis lance l'app
CMD ["/bin/sh", "-c", "npx prisma migrate deploy && node index.js"]

