import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  
  build: {
    // Optimize chunks and bundle size
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['antd', '@ant-design/icons'],
          'vendor-charts': ['recharts'],
          'vendor-http': ['axios'],
        }
      }
    },
    
    // Chunk size limits
    chunkSizeWarningLimit: 600,
    
    // Source map for production debugging
    sourcemap: false,
    
    // Use esbuild minification (faster than terser)
    minify: 'esbuild'
  },
  
  // Optimization for development
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'antd', '@ant-design/icons', 'axios', 'recharts']
  }
})
