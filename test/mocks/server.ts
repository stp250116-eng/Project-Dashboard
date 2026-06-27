import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/** MSW server instance for Node-based (Jest) tests. */
export const server = setupServer(...handlers);
