import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  devtools: {
    apply: 'serve',
  },
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1200,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'three', test: /node_modules[/\\](three|@react-three|three-stdlib|troika|maath|camera-controls)/ },
            { name: 'motion', test: /node_modules[/\\](gsap|@gsap|lenis)/ },
          ],
        },
      },
    },
  },
})
