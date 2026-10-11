FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY frontend ./frontend
COPY index.html vite.config.mjs ./
RUN npm run build
FROM node:22-slim
WORKDIR /app
COPY server.mjs moderation.mjs package.json ./
COPY --from=build /app/dist ./dist
USER node
EXPOSE 8787
CMD ["node","--experimental-sqlite","server.mjs"]
