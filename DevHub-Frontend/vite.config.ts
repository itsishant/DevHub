import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // optional
  },
  preview: {
    port: 4173, // optional
  },
  build: {
    outDir: 'dist',
  }
})
