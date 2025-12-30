#!/bin/sh
# Runtime environment variable replacement for Vite app
# Replaces __PLACEHOLDER__ values with actual environment variables
#
# NOTE: VITE_BASE_PATH is NOT replaceable at runtime because
# Vite uses it for asset URLs at build time

set -e

# Define placeholders and their corresponding env vars
replace_placeholder() {
    local placeholder=$1
    local value=$2

    if [ -n "$value" ]; then
        echo "Replacing $placeholder with runtime value"
        # Replace in all JS and HTML files
        find /usr/share/nginx/html -type f \( -name "*.js" -o -name "*.html" \) -exec sed -i "s|$placeholder|$value|g" {} + 2>/dev/null || true
    fi
}

# Replace all placeholders with runtime environment variables
replace_placeholder "__VITE_API_URL__" "${VITE_API_URL:-}"
replace_placeholder "__VITE_API_USERNAME__" "${VITE_API_USERNAME:-}"
replace_placeholder "__VITE_API_PASSWORD__" "${VITE_API_PASSWORD:-}"
replace_placeholder "__VITE_APP_NAME__" "${VITE_APP_NAME:-OpenJornada}"
replace_placeholder "__VITE_APP_LOGO__" "${VITE_APP_LOGO:-/logo.png}"

echo "Environment variables injected successfully"

# Execute nginx
exec "$@"
