import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { host: true, port: 5173 },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor':  ['react', 'react-dom', 'react-router-dom'],
          'motion':        ['framer-motion'],
          'stripe':        ['@stripe/stripe-js', '@stripe/react-stripe-js'],
          'supabase':      ['@supabase/supabase-js'],
          'charts':        ['recharts'],
          'dates':         ['date-fns'],
        },
      },
    },
  },
})
