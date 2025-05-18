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
            cookie: 'token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2ODFmNWM2MDc5ODRmNzA0N2FiNGFmNWQiLCJpYXQiOjE3NDY5NzI4MTYsImV4cCI6MTc0NzU3NzYxNn0.EWCQQ7PpEN_WvlgxTctome-Wl901mj0ddC34ugzjgpo'
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
