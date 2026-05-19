# Stage 1: Builder
# Resolving version mismatch: utilizing Node 20 LTS Alpine for security, compatibility, and a slim footprint
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency graphs first to leverage Docker layer caching
COPY package.json package-lock.json ./

# Use ci (Clean Install) for reproducible, deterministic builds
RUN npm ci

# Copy the rest of the application code
COPY . .

# Trigger svelte.config.js to fallback to @sveltejs/adapter-node
ENV DOCKER_BUILD=true

# Build the SvelteKit app
RUN npm run build

# Remove development dependencies to keep the final image minimal
RUN npm prune --production

# Stage 2: Runner
FROM node:20-alpine

WORKDIR /app

# Copy built assets and production node_modules from the builder stage
COPY --from=builder /app/build build/
COPY --from=builder /app/node_modules node_modules/
COPY package.json .

# Define production environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose the internal port (Docker Compose will map this internally to Nginx)
EXPOSE 3000

# Start the Node adapter application
CMD ["node", "build/index.js"]
