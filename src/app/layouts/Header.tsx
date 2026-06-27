import { appConfig } from '@shared/constants/appConfig';

/** Application header with product name and environment context. */
export const Header = (): JSX.Element => (
  <header className="app-header" role="banner">
    <div className="app-header__brand">{appConfig.appName}</div>
    <div className="app-header__actions">
      <span className="app-header__user" aria-label="Current user">
        Signed in
      </span>
    </div>
  </header>
);
