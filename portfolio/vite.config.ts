import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    TanStackRouterVite(),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 8080,
  },
  ssr: {
    noExternal: ['@tanstack/react-start'],
  },
  build: {
    rollupOptions: {
      input: {
        client: 'src/start.ts',
        server: 'src/server.ts',
      },
    },
  },
})