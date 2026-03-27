import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    /** Expose on LAN for mobile / device smoke testing (store prep). */
    host: true,
  },
})
