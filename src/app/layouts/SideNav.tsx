import { NavLink } from 'react-router-dom';
import { ROUTES } from '@shared/constants/routes';

interface NavItem {
  to: string;
  label: string;
}

const NAV_ITEMS: readonly NavItem[] = [
  { to: ROUTES.dashboard, label: 'Dashboard' },
  { to: ROUTES.defectDashboard, label: 'Defect Dashboard' },
  { to: ROUTES.complexityPoint, label: 'Complexity Point' },
  { to: ROUTES.developerTrainingDashboard, label: 'Developer Training Dashboard' },
  { to: ROUTES.overduePointDashboard, label: 'Overdue Point Dashboard' },
  { to: ROUTES.goalSetting, label: 'Goal Setting' },
];

/** Left-hand primary navigation. */
export const SideNav = (): JSX.Element => (
  <nav className="app-sidenav" aria-label="Primary">
    <ul className="app-sidenav__list">
      {NAV_ITEMS.map((item) => (
        <li key={item.to} className="app-sidenav__item">
          <NavLink
            to={item.to}
            className={({ isActive }) =>
              isActive ? 'app-sidenav__link app-sidenav__link--active' : 'app-sidenav__link'
            }
          >
            {item.label}
          </NavLink>
        </li>
      ))}
    </ul>
  </nav>
);
