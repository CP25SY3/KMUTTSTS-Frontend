# ---------- deps ----------
FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts

# ---------- build ----------
FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Build with dev deps available
RUN npm run build

# ---------- runner (SSR) ----------
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
# optional hygiene
ENV NEXT_TELEMETRY_DISABLED=1
# make the env available at build time
ARG NEXT_IMAGE_UNOPTIMIZED=1
ARG NEXT_PUBLIC_API_BASE_URL=http://cp25sy3.sit.kmutt.ac.th
ENV NEXT_IMAGE_UNOPTIMIZED=${NEXT_IMAGE_UNOPTIMIZED}
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}

# only production deps for smaller image
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

# app artifacts
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.* ./
COPY --from=build /app/node_modules/sharp ./node_modules/sharp
# If you have any server files (e.g., server.js), copy them too:
# COPY --from=build /app/server.js ./server.js

EXPOSE 3000
CMD ["npm","run","start"]
