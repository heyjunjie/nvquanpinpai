FROM node:22-slim@sha256:d649c27dae7ba0137b3cef5dd75baa422c08dc3d9e3fc0c23dfb172dc3cc6436 AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY frontend ./frontend
COPY public ./public
COPY index.html vite.config.mjs ./
COPY tsconfig.json ./
COPY tests/i18n-data.mjs tests/locale.mjs ./tests/
RUN npm run typecheck && npm run build && node tests/i18n-data.mjs && node tests/locale.mjs
FROM node:22-slim@sha256:d649c27dae7ba0137b3cef5dd75baa422c08dc3d9e3fc0c23dfb172dc3cc6436
WORKDIR /app
ARG RELEASE_SHA=development
ENV RELEASE_SHA=$RELEASE_SHA
LABEL org.opencontainers.image.revision=$RELEASE_SHA
COPY server.mjs moderation.mjs archive.mjs discovery.mjs editorial.mjs participation.mjs growth.mjs research.mjs research-pages.mjs global-data.mjs global-pages.mjs package.json ./
COPY tests ./tests
COPY frontend/presentation.mjs ./frontend/presentation.mjs
COPY frontend/routes.mjs frontend/reading.mjs frontend/share-card.mjs frontend/watch.mjs frontend/catalog.mjs ./frontend/
COPY frontend/locale.mjs frontend/i18n-data.mjs frontend/localized-props.mjs ./frontend/
COPY docs/editorial-briefs-20261013.json docs/evidence-tasks-20261013.json docs/global-cases-20261013.json ./docs/
COPY deploy/apply-event-dates.mjs ./deploy/apply-event-dates.mjs
COPY docs/event-dates-20261012.json ./docs/event-dates-20261012.json
COPY deploy/apply-propagation-dates.mjs ./deploy/apply-propagation-dates.mjs
COPY docs/propagation-dates-20261012.json ./docs/propagation-dates-20261012.json
COPY --from=build /app/dist ./dist
USER node
EXPOSE 8787
CMD ["node","--experimental-sqlite","server.mjs"]
