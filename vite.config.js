import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true, // Don't try other ports if 3000 is busy
    open: true,
    host: true // Allow external connections
  }
})