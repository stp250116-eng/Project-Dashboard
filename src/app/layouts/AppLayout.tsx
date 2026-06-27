import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { SideNav } from './SideNav';

/**
 * Top-level application shell: header, left navigation, routed content, footer.
 */
export const AppLayout = (): JSX.Element => (
  <div className="app-shell">
    <Header />
    <div className="app-shell__body">
      <SideNav />
      <main className="app-shell__content" role="main">
        <Outlet />
      </main>
    </div>
    <Footer />
  </div>
);
