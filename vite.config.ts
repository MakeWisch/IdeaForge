import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import express from 'express';
import { defineConfig, Plugin } from 'vite';
import { executeAITask } from './server/ai/aiService';
import { registry } from './server/ai/providerRegistry';

function apiServerPlugin(): Plugin {
  return {
    name: 'ideaforge-api',
    configureServer(server) {
      server.middlewares.use(express.json());

      server.middlewares.use(async (req: any, res, next) => {
        const url = req.url?.split('?')[0] || '';

        // Handle /api/ai status endpoint
        if (url === '/api/ai/status' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;
          res.end(JSON.stringify(registry.getStatus()));
          return;
        }

        // Handle normalized /api/ai POST endpoint
        if (url === '/api/ai' && req.method === 'POST') {
          res.setHeader('Content-Type', 'application/json');
          try {
            const body = req.body || {};
            const result = await executeAITask(body);
            res.statusCode = result.success ? 200 : (result.errorCode === 'AUTH_ERROR' ? 401 : 500);
            res.end(JSON.stringify(result));
            return;
          } catch (err: any) {
            console.error('API /api/ai error:', err);
            res.statusCode = 500;
            res.end(JSON.stringify({
              success: false,
              error: err?.message || 'Internal server error',
              errorCode: 'SERVER_ERROR'
            }));
            return;
          }
        }

        // Backward compatibility routes for /api/forge/*
        if (url.startsWith('/api/forge')) {
          res.setHeader('Content-Type', 'application/json');
          try {
            const body = req.body || {};

            if (url === '/api/forge/analyze' && req.method === 'POST') {
              const result = await executeAITask({
                task: 'analyze_idea',
                input: body.idea || ''
              });
              if (result.success && result.data) {
                res.statusCode = 200;
                res.end(JSON.stringify(result.data));
              } else {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: result.error || 'Failed to analyze idea' }));
              }
              return;
            }

            if (url === '/api/forge/blueprint' && req.method === 'POST') {
              const result = await executeAITask({
                task: 'prototype_plan',
                input: body.idea || '',
                context: { approach: body.approach }
              });
              if (result.success && result.data) {
                res.statusCode = 200;
                res.end(JSON.stringify(result.data));
              } else {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: result.error || 'Failed to generate blueprint' }));
              }
              return;
            }

            if (url === '/api/forge/challenge' && req.method === 'POST') {
              const result = await executeAITask({
                task: 'challenge_concern',
                input: body.concern || '',
                context: { idea: body.idea, concern: body.concern }
              });
              if (result.success && result.data) {
                res.statusCode = 200;
                res.end(JSON.stringify(result.data));
              } else {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: result.error || 'Failed to evaluate concern' }));
              }
              return;
            }

            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'Endpoint not found' }));
            return;
          } catch (err: any) {
            console.error('API error:', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err?.message || 'Server error' }));
            return;
          }
        }

        next();
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
