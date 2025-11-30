# ---------- deps ----------
FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts

# ---------- build ----------
FROM node:22-bookworm-slim AS build
WORKDIR /app

# ARG NEXT_PUBLIC_API_BASE_URL="http://cp25sy3.sit.kmutt.ac.th"
# ARG NEXT_IMAGE_UNOPTIMIZED="1"
# ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
# ENV NEXT_IMAGE_UNOPTIMIZED=${NEXT_IMAGE_UNOPTIMIZED}

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---------- runner (SSR) ----------
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.* ./
# COPY --from=build /app/node_modules/sharp ./node_modules/sharp

COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["./entrypoint.sh"]
CMD ["npm","run","start"]
