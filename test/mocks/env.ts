import type { RawEnv } from '../../src/shared/config/env';

/**
 * Jest mock for the Vite env module. Mirrors `.env`/`.env.example` defaults so
 * tests run without `import.meta`.
 */
export const env: RawEnv = {
  MODE: 'test',
  VITE_APP_NAME: 'Enterprise Dashboard',
  VITE_API_BASE_URL: 'https://localhost:5001/api',
  VITE_JIRA_BASE_URL: 'https://your-company.atlassian.net',
  VITE_JIRA_API_BASE: '/jira',
  VITE_JIRA_PROJECT_KEY: 'DASH',
  VITE_ENABLE_JIRA: 'true',
  VITE_ENABLE_REPORTS: 'true',
};
