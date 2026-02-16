FROM node:20-alpine AS builder
WORKDIR /app

# Install deps (including dev for build)
COPY package*.json tsconfig.json ./
COPY prisma ./prisma
RUN npm ci

# Copy source and build
COPY src ./src
RUN npm run build
RUN npx prisma generate

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install only production deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built app and prisma client
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

USER node
EXPOSE 5000
CMD ["node", "./dist/src/server.js"]
