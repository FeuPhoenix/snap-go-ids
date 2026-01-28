import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" &&
      ({
        name: "mock-process-photo",
        configureServer(server) {
          const RATE_LIMIT_WINDOW_MS = 60_000;
          const RATE_LIMIT_MAX_REQUESTS = 1;
          const rateLimitByIp = new Map<string, number[]>();

          const getIp = (req: import('http').IncomingMessage) => {
            const xff = req.headers['x-forwarded-for'];
            if (typeof xff === 'string' && xff.length) return xff.split(',')[0].trim();
            const addr = req.socket.remoteAddress;
            return addr || 'unknown';
          };

          const isRateLimited = (ip: string, nowMs: number) => {
            const existing = rateLimitByIp.get(ip) ?? [];
            const windowStart = nowMs - RATE_LIMIT_WINDOW_MS;
            const recent = existing.filter((t) => t > windowStart);
            if (recent.length >= RATE_LIMIT_MAX_REQUESTS) {
              rateLimitByIp.set(ip, recent);
              return true;
            }
            recent.push(nowMs);
            rateLimitByIp.set(ip, recent);
            return false;
          };

          server.middlewares.use((req, res, next) => {
            if (!req.url) return next();

            const url = new URL(req.url, 'http://localhost');
            if (url.pathname !== '/api/process-photo') return next();

            if (req.method === 'OPTIONS') {
              res.statusCode = 204;
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.setHeader('Access-Control-Allow-Headers', 'content-type, x-tester-auth');
              res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
              res.end();
              return;
            }

            const expected = process.env.TESTER_ACCESS_TOKEN || '';
            if (!expected) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Server auth not configured: set TESTER_ACCESS_TOKEN before starting Vite' }));
              return;
            }
            const tokenFromQuery = url.searchParams.get('access') || '';
            const tokenFromHeader = (req.headers['x-tester-auth'] as string | undefined) || '';
            const provided = tokenFromHeader || tokenFromQuery;
            if (!expected || !provided || provided !== expected) {
              res.statusCode = 401;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Unauthorized' }));
              return;
            }

            const ip = getIp(req);
            if (isRateLimited(ip, Date.now())) {
              res.statusCode = 429;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Too Many Requests' }));
              return;
            }

            if (req.method !== 'POST') {
              res.statusCode = 405;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Method Not Allowed' }));
              return;
            }

            let body = '';
            req.on('data', (chunk) => {
              body += chunk;
            });
            req.on('end', () => {
              try {
                const parsed = body ? JSON.parse(body) : {};
                if (!parsed?.image) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: 'No image provided' }));
                  return;
                }

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(
                  JSON.stringify({
                    success: true,
                    variations: [
                      { imageBase64: parsed.image, mimeType: parsed.mimeType || 'image/png' },
                      { imageBase64: parsed.image, mimeType: parsed.mimeType || 'image/png' },
                      { imageBase64: parsed.image, mimeType: parsed.mimeType || 'image/png' },
                      { imageBase64: parsed.image, mimeType: parsed.mimeType || 'image/png' },
                    ],
                  })
                );
              } catch {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
              }
            });
          });
        },
      } as const),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
