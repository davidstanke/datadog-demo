# --- Stage 1: Base image with dependencies ---
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# --- Stage 2: Development (No Datadog, fast reloads) ---
FROM base AS development
ENV NODE_ENV=development
CMD ["npm", "run", "dev"]

# --- Stage 3: Production / Cloud Run (With Datadog) ---
FROM base AS production
ENV NODE_ENV=production
ENV NODE_OPTIONS="--import dd-trace/register.js"
# Pull the Datadog serverless-init binary
COPY --from=datadog/serverless-init:1-alpine /datadog-init /app/datadog-init
ENTRYPOINT ["/app/datadog-init"]
CMD ["node", "app.js"]