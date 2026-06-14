import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// In GitHub Codespaces the dev server runs inside a container and is reached
// through an HTTPS proxy on port 443. Vite must bind to 0.0.0.0 and be told that
// the HMR client connects over 443 (wss), otherwise the browser requests
// /src/main.jsx and /@vite/client from the wrong origin and 404s (blank page).
const inCodespaces = !!process.env.CODESPACES

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,          // bind to 0.0.0.0 so the Codespaces proxy can reach it
    port: 5173,
    strictPort: true,    // fail loudly instead of silently switching ports
    hmr: inCodespaces
      ? { protocol: 'wss', clientPort: 443 }
      : undefined,
  },
})
