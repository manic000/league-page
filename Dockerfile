# Stage 1: Dependency Install & Build
FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json ./

# 1. Install dependencies but block the 'prepare' script from firing prematurely
RUN npm ci --ignore-scripts

# 2. Copy the rest of the application code, including /static and /src/theme
COPY . .

# 3. Manually trigger the prepare script now that the required directories exist
RUN npm run prepare

# 4. Trigger adapter-node directly, bypassing the broken --verbose flag in package.json
RUN DOCKER_BUILD=true npm run build

# 5. Prune dev dependencies to prepare a clean node_modules layer for production
RUN npm prune --omit=dev

# Stage 2: Production Runtime
FROM node:20-alpine AS runner

WORKDIR /app

# Tini manages PID 1 signals to prevent Node from hanging during shutdown
#RUN apk add --no-cache tini

# Import strictly the necessary artifacts from the builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules

# Bind host to 0.0.0.0 internally so Docker can route traffic
ENV PORT=3000
ENV HOST=0.0.0.0
ENV NODE_ENV=production

EXPOSE 3000

#ENTRYPOINT ["tini", "--"]
CMD ["node", "build/index.js"]
