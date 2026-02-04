# Dockerfile pour Railway - Backend NestJS
FROM node:20-alpine AS builder

WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation des dépendances (sans cache mount problématique)
RUN npm ci --prefer-offline --no-audit

# Copie du code source
COPY . .

# Build de l'application
RUN npm run build

# Stage de production
FROM node:20-alpine AS production

WORKDIR /app

# Copie des fichiers nécessaires depuis le builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Expose le port (Railway utilise la variable PORT)
EXPOSE 3000

# Démarrage de l'application
CMD ["node", "dist/main"]
