# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# API URL must be set at build time for Next.js public env vars
ARG NEXT_PUBLIC_API_URL=http://62.171.139.44:3001
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# Production stage — Next.js standalone server
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

# Copy standalone server and its node_modules
COPY --from=build /app/.next/standalone ./
# Copy static assets (.next/static)
COPY --from=build /app/.next/static ./.next/static
# Copy public folder
COPY --from=build /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
