# Use the official lightweight Node.js 20 Alpine image
FROM node:20-alpine

# Set node environment to production
ENV NODE_ENV=production

# Create and define the application working directory
WORKDIR /usr/src/app

# Copy dependency manifests first to leverage Docker layer caching
COPY package*.json ./

# Install production-only dependencies (ignores devDependencies like puppeteer)
RUN npm ci --only=production

# Copy application source files
COPY app.js ./
COPY public/ ./public/
COPY views/ ./views/

# Use non-root system user provided by the base image for runtime security
USER node

# Document the default port. Cloud Run automatically injects its own PORT
# environment variable, and the app's app.js dynamically listens to process.env.PORT.
EXPOSE 5173

# Start the server
CMD [ "node", "app.js" ]
