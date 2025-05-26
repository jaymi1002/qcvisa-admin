import { mergeConfig } from 'vite'
import eslint from 'vite-plugin-eslint'
import baseConfig from './vite.config.base'

export default mergeConfig(
  {
    mode: 'development',
    server: {
      open: true,
      host: '0.0.0.0',
      fs: {
        strict: true,
      },
      proxy: {
        '/api': {
          target: 'http://localhost',
          changeOrigin: true,
          header: {
            cookie: 'token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2ODI5YTJmM2M0ODk3MjMxYzI1NmY2ZDUiLCJpYXQiOjE3NDgyNjg5NjgsImV4cCI6MTc0ODg3Mzc2OH0.g4PB2ktYXutCIiRi3NYKRo9CIkAqEp8q80jija9sVQc'
          }
        }
      }
    },
    plugins: [
      eslint({
        cache: false,
        include: ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.vue'],
        exclude: ['node_modules'],
      }),
    ],
  },
  baseConfig
)
