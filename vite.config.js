import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Para que funcione bien si lo subes a Vercel o un subdirectorio
  base: './', 
  server: {
    port: 3000,
    open: true, // Abre el navegador automáticamente al hacer npm run dev
  },
  preview: {
    port: 4173,
    open: true, // Abre el navegador automáticamente al hacer npm run preview
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Ponlo en true si necesitas debuguear en producción
  }
})