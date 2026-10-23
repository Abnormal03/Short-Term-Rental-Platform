import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: [
      "patient-distinct-tuner-univ.trycloudflare.com"
    ],
    proxy: {
      '/api': {
        target: 'https://short-term-rental-platform.onrender.com',
        // target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
})
