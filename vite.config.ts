import 'dotenv/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import newtaipeiHandler from './api/parking/newtaipei';
import taichungHandler from './api/parking/taichung';
import taipeiHandler from './api/parking/taipei';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'local-api-middleware',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          const url = req.url || '';
          if (url.startsWith('/api/parking/newtaipei')) {
            const mockRes = {
              status(code: number) { res.statusCode = code; return mockRes; },
              setHeader(k: string, v: string) { res.setHeader(k, v); },
              json(data: any) {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
              }
            };
            return newtaipeiHandler(req, mockRes);
          }
          if (url.startsWith('/api/parking/taichung')) {
            const mockRes = {
              status(code: number) { res.statusCode = code; return mockRes; },
              setHeader(k: string, v: string) { res.setHeader(k, v); },
              json(data: any) {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
              }
            };
            return taichungHandler(req, mockRes);
          }
          if (url.startsWith('/api/parking/taipei')) {
            const mockRes = {
              status(code: number) { res.statusCode = code; return mockRes; },
              setHeader(k: string, v: string) { res.setHeader(k, v); },
              json(data: any) {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
              }
            };
            return taipeiHandler(req, mockRes);
          }
          next();
        });
      }
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});

