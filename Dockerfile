# ---- Build stage ----
# Pin to Alpine 3.17: its system OpenSSL is 1.1.x, so libssl.so.1.1 is present
# natively. Prisma 5.x query engine links against libssl.so.1.1, so this avoids
# the "openssl1.1-compat (no such package)" failure that occurs on Alpine 3.20+.
FROM node:18-alpine3.17 AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm install

COPY . .

ENV NEXT_PUBLIC_DEPLOY_ENV=domestic
RUN npx prisma generate
RUN npm run build

# ---- Run stage ----
FROM node:18-alpine3.17 AS runner

WORKDIR /app

ENV NODE_ENV=production

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
