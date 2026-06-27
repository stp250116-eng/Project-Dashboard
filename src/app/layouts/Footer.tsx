import { env } from '@shared/config/env';

/** Application footer with copyright and version metadata. */
export const Footer = (): JSX.Element => (
  <footer className="app-footer" role="contentinfo">
    <span>© {new Date().getFullYear()} Enterprise Dashboard</span>
    <span className="app-footer__version">v{env.MODE}</span>
  </footer>
);
