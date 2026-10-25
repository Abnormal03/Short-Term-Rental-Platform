import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  return {
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: [
      "patient-distinct-tuner-univ.trycloudflare.com"
    ],
    proxy: {
      '/api': {
        target: env.VITE_DEV_API_PROXY_TARGET || 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
  }
})
