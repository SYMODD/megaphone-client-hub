import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-popover',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-collapsible',
            '@radix-ui/react-context-menu',
            '@radix-ui/react-hover-card',
            '@radix-ui/react-menubar',
            '@radix-ui/react-progress',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-separator',
            '@radix-ui/react-slider',
            '@radix-ui/react-switch',
            '@radix-ui/react-toggle',
            '@radix-ui/react-toggle-group'
          ],
          'vendor-data': [
            '@tanstack/react-query',
            '@supabase/supabase-js',
            'react-hook-form',
            '@hookform/resolvers',
            'zod'
          ],
          'vendor-charts': ['recharts'],
          'vendor-pdf': [
            'jspdf',
            'jspdf-autotable',
            'pdf-lib'
          ],
          'vendor-utils': [
            'date-fns',
            'clsx',
            'class-variance-authority',
            'tailwind-merge',
            'lucide-react'
          ],
          'vendor-specialized': [
            'react-easy-crop',
            'react-day-picker',
            'embla-carousel-react',
            'react-resizable-panels',
            'input-otp',
            'cmdk',
            'sonner',
            'vaul',
            'next-themes'
          ]
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const extType = assetInfo.name?.split('.').at(1);
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType || '')) {
            return `assets/img/[name]-[hash][extname]`;
          }
          if (/woff2?|eot|ttf|otf/i.test(extType || '')) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          return `assets/[ext]/[name]-[hash][extname]`;
        }
      }
    },
    target: 'es2020',
    minify: 'esbuild',
    cssMinify: true,
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    reportCompressedSize: true,

  },
  server: {
    hmr: {
      overlay: false
    }
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      '@supabase/supabase-js',
      'recharts',
      'lodash',
      'lodash/get',
      'lodash/merge',
      'lodash/isNil',
      'lodash/isFunction'
    ],
    exclude: []
  },
  css: {
    devSourcemap: false,
    preprocessorOptions: {
      css: {
        charset: false
      }
    }
  }
})