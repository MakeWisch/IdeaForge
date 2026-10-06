import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import {
  analyzeIdeaWithGemini,
  generateBlueprintWithGemini,
  challengeConcernWithGemini
} from './server/geminiService';

function parseBody(req: any): Promise<any> {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk: any) => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch {
        resolve({});
      }
    });
  });
}

function apiServerPlugin(): Plugin {
  return {
    name: 'ideaforge-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/forge')) {
          return next();
        }

        res.setHeader('Content-Type', 'application/json');

        try {
          if (req.url === '/api/forge/analyze' && req.method === 'POST') {
            const body = await parseBody(req);
            const idea = body.idea || '';
            const result = await analyzeIdeaWithGemini(idea);
            res.statusCode = 200;
            res.end(JSON.stringify(result));
            return;
          }

          if (req.url === '/api/forge/blueprint' && req.method === 'POST') {
            const body = await parseBody(req);
            const { idea, approach } = body;
            const result = await generateBlueprintWithGemini(idea, approach);
            res.statusCode = 200;
            res.end(JSON.stringify(result));
            return;
          }

          if (req.url === '/api/forge/challenge' && req.method === 'POST') {
            const body = await parseBody(req);
            const { idea, concern } = body;
            const result = await challengeConcernWithGemini(idea, concern);
            res.statusCode = 200;
            res.end(JSON.stringify(result));
            return;
          }

          res.statusCode = 404;
          res.end(JSON.stringify({ error: 'Endpoint not found' }));
        } catch (err: any) {
          console.error('API error:', err);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err?.message || 'Server error' }));
        }
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiServerPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
