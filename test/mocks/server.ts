/**
 * MSW server instance for Node-based (Jest) tests.
 *
 * Some development environments (CI runners, locked-down workstations) may
 * not have `msw` installed. Tests should still be able to run in a degraded
 * mode where the MSW server is a no-op. Try to load `msw/node` at runtime
 * and fall back to a lightweight shim when it isn't available.
 */
let server: { listen: (...args: any[]) => void; resetHandlers: () => void; close: () => void };

try {
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const { setupServer } = require('msw/node');
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const { handlers } = require('./handlers');
	server = setupServer(...handlers);
} catch {
	// Fallback no-op server: provides the same lifecycle methods so tests
	// that call `server.listen()` won't throw when `msw` is unavailable.
	// This is intentionally minimal — without handlers, tests that expect
	// HTTP interception may fail logically, but they'll at least execute.
	// Keep the methods synchronous and side-effect free.
	const noop = () => undefined;
	server = {
		listen: noop,
		resetHandlers: noop,
		close: noop,
	};
}

export { server };
