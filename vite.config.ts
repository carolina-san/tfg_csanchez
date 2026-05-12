import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'

const deferCssPlugin = (): Plugin => ({
  name: 'defer-css',
  enforce: 'post',
  transformIndexHtml(html) {
    return html.replace(
      /<link rel="stylesheet" crossorigin href="(.*?)">/g,
      `<link rel="preload" as="style" crossorigin href="$1">\n    <link rel="stylesheet" crossorigin href="$1" media="print" onload="this.media='all'">\n    <noscript><link rel="stylesheet" crossorigin href="$1"></noscript>`
    );
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    deferCssPlugin(),
  ],
  server: {
    allowedHosts: true,
  },
  build: {
    modulePreload: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', 'swr'],
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          charts: ['recharts'],
          ui: ['lucide-react', 'konva', 'react-konva'],
        },
      },
    },
    chunkSizeWarningLimit: 1200,
  },
})
