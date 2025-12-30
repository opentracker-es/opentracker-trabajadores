import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // This loads variables from .env files for local development
  const env = loadEnv(mode, process.cwd(), '')

  // Base path for the app (e.g., '/trabajadores/' in production)
  const basePath = env.VITE_BASE_PATH || process.env.VITE_BASE_PATH || '/'

  // App name for PWA manifest and title
  const appName = env.VITE_APP_NAME || process.env.VITE_APP_NAME || 'OpenJornada'

  return {
    base: basePath,
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'favicon.svg', 'favicon-96x96.png', 'apple-touch-icon.png'],
        manifest: {
          name: `${appName} - Registro de Jornada`,
          short_name: appName,
          description: 'Sistema de registro de jornada laboral',
          theme_color: '#ffffff',
          background_color: '#ffffff',
          display: 'standalone',
          start_url: basePath,
          scope: basePath,
          icons: [
            {
              src: 'web-app-manifest-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'maskable'
            },
            {
              src: 'web-app-manifest-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            },
            {
              src: 'web-app-manifest-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any'
            }
          ]
        },
        workbox: {
          // Cache de archivos estáticos (JS, CSS, imágenes)
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          // No cachear llamadas a la API
          navigateFallback: 'index.html',
          navigateFallbackDenylist: [/^\/api/],
          runtimeCaching: [
            {
              // Siempre ir a la red para la API
              urlPattern: /^https?:\/\/.*\/api\/.*/i,
              handler: 'NetworkOnly'
            }
          ],
          // Limpiar caches antiguas automáticamente
          cleanupOutdatedCaches: true,
          // Activar el nuevo service worker inmediatamente
          skipWaiting: true,
          clientsClaim: true
        },
        devOptions: {
          enabled: false // Deshabilitado en desarrollo
        }
      })
    ],
    server: {
      port: 3000,
      host: true
    },
    define: {
      // For Docker/production builds, use process.env
      // For local dev, Vite will use .env files automatically
      // We only define these if they exist in process.env (Docker scenario)
      ...(process.env.VITE_API_URL && {
        'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL)
      }),
      ...(process.env.VITE_API_USERNAME && {
        'import.meta.env.VITE_API_USERNAME': JSON.stringify(process.env.VITE_API_USERNAME)
      }),
      ...(process.env.VITE_API_PASSWORD && {
        'import.meta.env.VITE_API_PASSWORD': JSON.stringify(process.env.VITE_API_PASSWORD)
      }),
      ...(process.env.VITE_APP_NAME && {
        'import.meta.env.VITE_APP_NAME': JSON.stringify(process.env.VITE_APP_NAME)
      }),
      ...(process.env.VITE_APP_LOGO && {
        'import.meta.env.VITE_APP_LOGO': JSON.stringify(process.env.VITE_APP_LOGO)
      }),
      ...(process.env.VITE_BASE_PATH && {
        'import.meta.env.VITE_BASE_PATH': JSON.stringify(process.env.VITE_BASE_PATH)
      }),
    }
  }
})
