import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '^/(UserManagement|services|Profile|Feedback|Auth|Staff|AdminDashboard|Announcements|Booking|Notifications|Messaging)': {
        target: 'http://localhost/senior-nooralshams/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/(UserManagement|services|Profile|Feedback|Auth|Staff|AdminDashboard|Announcements|Booking|Notifications|Messaging)/, '/$1'),
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
