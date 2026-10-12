FROM node:22-slim@sha256:d649c27dae7ba0137b3cef5dd75baa422c08dc3d9e3fc0c23dfb172dc3cc6436 AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY frontend ./frontend
COPY index.html vite.config.mjs ./
COPY tsconfig.json ./
RUN npm run typecheck && npm run build
FROM node:22-slim@sha256:d649c27dae7ba0137b3cef5dd75baa422c08dc3d9e3fc0c23dfb172dc3cc6436
WORKDIR /app
ARG RELEASE_SHA=development
ENV RELEASE_SHA=$RELEASE_SHA
LABEL org.opencontainers.image.revision=$RELEASE_SHA
COPY server.mjs moderation.mjs archive.mjs package.json ./
COPY tests ./tests
COPY frontend/presentation.mjs ./frontend/presentation.mjs
COPY deploy/apply-event-dates.mjs ./deploy/apply-event-dates.mjs
COPY docs/event-dates-20261012.json ./docs/event-dates-20261012.json
COPY deploy/apply-propagation-dates.mjs ./deploy/apply-propagation-dates.mjs
COPY docs/propagation-dates-20261012.json ./docs/propagation-dates-20261012.json
COPY --from=build /app/dist ./dist
USER node
EXPOSE 8787
CMD ["node","--experimental-sqlite","server.mjs"]
