describe('appConfig', () => {
  afterEach(() => {
    jest.resetModules();
  });

  const loadWith = (envValues: Record<string, string | undefined>) => {
    let mod!: typeof import('./appConfig');
    jest.isolateModules(() => {
      jest.doMock('@shared/config/env', () => ({ env: { MODE: 'test', ...envValues } }));
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      mod = require('./appConfig');
    });
    return mod;
  };

  it('applies the documented fallback defaults when env vars are absent', () => {
    const { appConfig } = loadWith({});
    expect(appConfig).toEqual({
      appName: 'Enterprise Dashboard',
      apiBaseUrl: 'https://localhost:5001/api',
      jiraBaseUrl: '',
      jiraApiBase: '/jira',
      jiraProjectKey: 'DASH',
      featureFlags: { jira: true, reports: true },
    });
  });

  it('parses feature flags case-insensitively', () => {
    const { appConfig } = loadWith({
      VITE_APP_NAME: 'Custom',
      VITE_ENABLE_JIRA: 'FALSE',
      VITE_ENABLE_REPORTS: 'TruE',
    });
    expect(appConfig.appName).toBe('Custom');
    expect(appConfig.featureFlags.jira).toBe(false);
    expect(appConfig.featureFlags.reports).toBe(true);
  });

  it('toBool falls back to false when no fallback is supplied', () => {
    const { __test__ } = loadWith({});
    expect(__test__.toBool(undefined)).toBe(false);
    expect(__test__.toBool('true')).toBe(true);
  });
});
