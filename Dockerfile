FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY frontend ./frontend
COPY index.html vite.config.mjs ./
COPY tsconfig.json ./
RUN npm run typecheck && npm run build
FROM node:22-slim
WORKDIR /app
ARG RELEASE_SHA=development
ENV RELEASE_SHA=$RELEASE_SHA
LABEL org.opencontainers.image.revision=$RELEASE_SHA
COPY server.mjs moderation.mjs archive.mjs package.json ./
COPY tests ./tests
COPY --from=build /app/dist ./dist
USER node
EXPOSE 8787
CMD ["node","--experimental-sqlite","server.mjs"]
