import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

/** Same-origin path the browser uses to reach Jira; proxied to Jira Cloud below. */
const JIRA_PROXY_PREFIX = '/jira';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load every env var (no `VITE_` filter) so the dev server can read the
  // server-only Jira credentials without ever exposing them to the client.
  const env = loadEnv(mode, process.cwd(), '');
  const jiraTarget = env.VITE_JIRA_BASE_URL;
  const jiraEmail = env.JIRA_EMAIL;
  const jiraToken = env.JIRA_API_TOKEN;
  const jiraAuth =
    jiraEmail && jiraToken
      ? Buffer.from(`${jiraEmail}:${jiraToken}`).toString('base64')
      : undefined;

  return {
    plugins: [react()],
    resolve: {
      alias: [
        // KendoReact Charts ship two builds with incompatible inheritance styles:
        // the ESM build's `shape-builder` uses ES5-style `Class.apply(this)` while
        // `@progress/kendo-drawing` exports a native `class Class {}`. esbuild
        // cannot lower native classes to ES5, so the mix throws
        // "Class constructor Class cannot be invoked without 'new'". Forcing the
        // geometry packages to their internally-consistent CommonJS builds resolves it.
        {
          find: /^@progress\/kendo-charts$/,
          replacement: fileURLToPath(
            new URL('./node_modules/@progress/kendo-charts/dist/npm/main.js', import.meta.url),
          ),
        },
        {
          find: /^@progress\/kendo-drawing$/,
          replacement: fileURLToPath(
            new URL('./node_modules/@progress/kendo-drawing/dist/npm/main.js', import.meta.url),
          ),
        },
        { find: '@app', replacement: fileURLToPath(new URL('./src/app', import.meta.url)) },
        {
          find: '@features',
          replacement: fileURLToPath(new URL('./src/features', import.meta.url)),
        },
        {
          find: '@integrations',
          replacement: fileURLToPath(new URL('./src/integrations', import.meta.url)),
        },
        { find: '@shared', replacement: fileURLToPath(new URL('./src/shared', import.meta.url)) },
        { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
      ],
    },
    server: {
      port: 5173,
      strictPort: false,
      // Browsers cannot call Jira Cloud's REST API directly (no CORS headers),
      // so the dev server proxies same-origin `/jira/*` calls to Jira and
      // injects Basic auth server-side. Keeps tokens out of the client bundle.
      //
      // The trailing slash is required: a bare `/jira` prefix also matches SPA
      // routes such as `/jira-overview`, forwarding them to Jira Cloud (which
      // returns its "dead link" page) instead of serving the app.
      proxy: jiraTarget
        ? {
            [`${JIRA_PROXY_PREFIX}/`]: {
              target: jiraTarget,
              changeOrigin: true,
              secure: true,
              rewrite: (path) => path.replace(new RegExp(`^${JIRA_PROXY_PREFIX}`), ''),
              configure: (proxy) => {
                proxy.on('proxyReq', (proxyReq) => {
                  if (jiraAuth) {
                    proxyReq.setHeader('Authorization', `Basic ${jiraAuth}`);
                  }
                });
              },
            },
          }
        : undefined,
    },
    optimizeDeps: {
      // Pre-bundle the KendoReact charting stack so the CommonJS geometry builds
      // (aliased above) are converted to ESM consistently for the dev server.
      include: [
        '@progress/kendo-react-charts',
        '@progress/kendo-charts',
        '@progress/kendo-drawing',
      ],
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
    },
  };
});

