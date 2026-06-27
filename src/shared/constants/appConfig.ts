/**
 * Centralized, typed access to environment configuration.
 * All runtime configuration MUST be read through this module — never read
 * the raw env (`@shared/config/env`) directly elsewhere in the codebase.
 */
import { env } from '@shared/config/env';

const toBool = (value: string | undefined, fallback = false): boolean => {
  if (value === undefined) return fallback;
  return value.toLowerCase() === 'true';
};

/** @internal Exported for unit testing of the env-flag parsing branches. */
export const __test__ = { toBool };

export interface AppConfig {
  appName: string;
  apiBaseUrl: string;
  jiraBaseUrl: string;
  jiraApiBase: string;
  jiraProjectKey: string;
  featureFlags: {
    jira: boolean;
    reports: boolean;
  };
}

export const appConfig: AppConfig = {
  appName: env.VITE_APP_NAME ?? 'Enterprise Dashboard',
  apiBaseUrl: env.VITE_API_BASE_URL ?? 'https://localhost:5001/api',
  jiraBaseUrl: env.VITE_JIRA_BASE_URL ?? '',
  // Same-origin base the browser uses to reach Jira. In dev the Vite proxy
  // forwards `/jira/*` to Jira Cloud (injecting auth); in prod a BFF/reverse
  // proxy serves the same path. Never call Jira Cloud directly (CORS).
  jiraApiBase: env.VITE_JIRA_API_BASE ?? '/jira',
  jiraProjectKey: env.VITE_JIRA_PROJECT_KEY ?? 'DASH',
  featureFlags: {
    jira: toBool(env.VITE_ENABLE_JIRA, true),
    reports: toBool(env.VITE_ENABLE_REPORTS, true),
  },
};
