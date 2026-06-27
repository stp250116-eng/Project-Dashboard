/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: '<rootDir>/test/helpers/jsdom-web-apis-env.cjs',
  roots: ['<rootDir>/src', '<rootDir>/test'],
  setupFilesAfterEnv: ['<rootDir>/test/helpers/setupTests.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@shared/config/env$': '<rootDir>/test/mocks/env.ts',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@app/(.*)$': '<rootDir>/src/app/$1',
    '^@features/(.*)$': '<rootDir>/src/features/$1',
    '^@integrations/(.*)$': '<rootDir>/src/integrations/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
  },
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/**/index.ts',
    '!src/**/*.types.ts',
    // The sole `import.meta` isolation point; aliased to a mock in tests and
    // cannot be compiled by ts-jest (CommonJS) for coverage instrumentation.
    '!src/shared/config/env.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.jest.json',
        // Transpile-only: skip per-file type-checking for speed. Type safety is
        // still enforced by `npm run typecheck` (tsc) and the production build.
        isolatedModules: true,
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!(msw|@bundled-es-modules)/)'],
};
