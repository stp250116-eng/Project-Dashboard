/**
 * Single point of access to Vite's `import.meta.env`. Centralizing it here is
 * the ONLY place `import.meta` is used, so non-Vite tooling (Jest) can alias
 * this module to a plain mock instead of dealing with `import.meta` syntax.
 */
export interface RawEnv {
  MODE: string;
  VITE_APP_NAME?: string;
  VITE_API_BASE_URL?: string;
  VITE_JIRA_BASE_URL?: string;
  VITE_JIRA_API_BASE?: string;
  VITE_JIRA_PROJECT_KEY?: string;
  VITE_ENABLE_JIRA?: string;
  VITE_ENABLE_REPORTS?: string;
}

export const env: RawEnv = import.meta.env as unknown as RawEnv;
