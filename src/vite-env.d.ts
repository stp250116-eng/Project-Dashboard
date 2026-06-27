/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_JIRA_BASE_URL: string;
  readonly VITE_JIRA_PROJECT_KEY: string;
  readonly VITE_ENABLE_JIRA: string;
  readonly VITE_ENABLE_REPORTS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
