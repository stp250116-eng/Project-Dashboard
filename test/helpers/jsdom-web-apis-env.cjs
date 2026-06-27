/**
 * Custom Jest environment: jsdom plus the WHATWG Web APIs that some libraries
 * expect on the global object but that jsdom does not implement.
 *
 * React Router's data routers (`createBrowserRouter`) construct `Request`
 * objects during navigation, and Node 18+ exposes `Request`, `Response`,
 * `fetch`, streams, etc. as globals in the main realm. jsdom replaces
 * `globalThis`, so those globals are not visible inside tests. Here we copy
 * them from the Node realm into the jsdom global.
 */
const JSDOMEnvironment = require('jest-environment-jsdom').default;

class JsdomWithWebApisEnvironment extends JSDOMEnvironment {
  constructor(config, context) {
    super(config, context);

    const webApiGlobals = {
      TextEncoder,
      TextDecoder,
      ReadableStream,
      WritableStream,
      TransformStream,
      Request,
      Response,
      Headers,
      fetch,
      FormData,
      Blob,
      structuredClone,
    };

    for (const [key, value] of Object.entries(webApiGlobals)) {
      if (typeof value !== 'undefined' && typeof this.global[key] === 'undefined') {
        this.global[key] = value;
      }
    }

    // `Request` (undici) validates that `signal` is an undici `AbortSignal`.
    // jsdom ships its own incompatible `AbortController`, so force the Node
    // implementations to keep them consistent with the injected `Request`.
    if (typeof AbortController !== 'undefined') {
      this.global.AbortController = AbortController;
    }
    if (typeof AbortSignal !== 'undefined') {
      this.global.AbortSignal = AbortSignal;
    }
  }
}

module.exports = JsdomWithWebApisEnvironment;
