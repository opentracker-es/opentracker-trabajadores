# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Remove package-lock to avoid conflicts with Alpine
RUN rm -f package-lock.json

# Install dependencies and force Rollup to install Alpine-compatible binaries
RUN npm install --force && \
    npm install @rollup/rollup-linux-x64-musl --force --save-optional

# Copy source code
COPY . .

# VITE_BASE_PATH MUST be set at build time (affects asset URLs)
# Use "/" for root path or "/trabajadores" for subpath
ARG VITE_BASE_PATH="/"

# Build with PLACEHOLDER values for runtime-configurable vars
ENV VITE_API_URL=__VITE_API_URL__
ENV VITE_API_USERNAME=__VITE_API_USERNAME__
ENV VITE_API_PASSWORD=__VITE_API_PASSWORD__
ENV VITE_APP_NAME=__VITE_APP_NAME__
ENV VITE_APP_LOGO=__VITE_APP_LOGO__
ENV VITE_BASE_PATH=$VITE_BASE_PATH

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built app from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Expose port 80
EXPOSE 80

# Default values for runtime (can be overridden)
ENV VITE_API_URL=""
ENV VITE_API_USERNAME=""
ENV VITE_API_PASSWORD=""
ENV VITE_APP_NAME="OpenJornada"
ENV VITE_APP_LOGO="/logo.png"

# Use entrypoint to replace placeholders at runtime
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
