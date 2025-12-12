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

# Build arguments for environment variables
ARG VITE_API_URL=https://jornada.codefriends.es/core
ARG VITE_API_USERNAME
ARG VITE_API_PASSWORD
ARG VITE_APP_NAME="OpenTracker"
ARG VITE_APP_LOGO="/logo.png"
ARG VITE_BASE_PATH="/"

# Set environment variables for build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_API_USERNAME=$VITE_API_USERNAME
ENV VITE_API_PASSWORD=$VITE_API_PASSWORD
ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_APP_LOGO=$VITE_APP_LOGO
ENV VITE_BASE_PATH=$VITE_BASE_PATH

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built app from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
