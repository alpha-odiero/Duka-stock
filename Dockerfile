# ---- Build stage: install deps, generate Prisma client, build client & server ----
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY client/package.json client/
COPY server/package.json server/
RUN npm ci
COPY client client
COPY server server
RUN npx prisma generate --schema server/prisma/schema.prisma
RUN npm run build

# ---- Runtime stage: only what is needed to serve the API + static client ----
FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY client/package.json client/
COPY server/package.json server/
RUN npm ci && npx prisma generate --schema server/prisma/schema.prisma

COPY --from=build /app/server/dist server/dist
COPY --from=build /app/client/dist client/dist

EXPOSE 4000
WORKDIR /app/server
CMD ["node", "dist/server.js"]
