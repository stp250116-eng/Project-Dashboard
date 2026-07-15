import '@testing-library/jest-dom';
import { server } from '../mocks/server';

// jsdom does not implement crypto.randomUUID in all versions — provide a shim
// so interceptor code that generates correlation ids works under tests.
if (typeof globalThis.crypto === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).crypto = {};
}
if (typeof globalThis.crypto.randomUUID !== 'function') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis.crypto as any).randomUUID = (): string =>
    '00000000-0000-4000-8000-000000000000';
}

// KendoReact Charts rely on canvas/resize APIs not present in jsdom.
if (typeof globalThis.ResizeObserver === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).ResizeObserver = class {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  };
}

// Start MSW server for HTTP-level request mocking in Jest environment
// Register lifecycle hooks
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
