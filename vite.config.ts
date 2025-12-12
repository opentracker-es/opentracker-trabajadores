import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // This loads variables from .env files for local development
  const env = loadEnv(mode, process.cwd(), '')

  return {
    base: env.VITE_BASE_PATH || process.env.VITE_BASE_PATH || '/',
    plugins: [react()],
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
