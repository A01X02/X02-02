# ---- Build stage ----
FROM node:18-alpine AS builder

WORKDIR /app

# Prisma 5.x query engine needs libssl.so.1.1; Alpine's default OpenSSL is 3.x.
# Install the 1.1 compat lib so prisma generate / build-time DB probes don't fail.
RUN apk add --no-cache openssl1.1-compat

COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm install

COPY . .

ENV NEXT_PUBLIC_DEPLOY_ENV=domestic
RUN npx prisma generate
RUN npm run build

# ---- Run stage ----
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Same OpenSSL 1.1 compat lib for the runtime Prisma engine.
RUN apk add --no-cache openssl1.1-compat

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
# Safety net: ensure the generated Prisma client + native engine .so.node
# are present at the path the app imports (@/generated/prisma).
COPY --from=builder /app/src/generated/prisma ./src/generated/prisma

EXPOSE 3000

CMD ["node", "server.js"]
