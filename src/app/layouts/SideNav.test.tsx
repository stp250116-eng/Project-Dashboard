import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SideNav } from './SideNav';

describe('SideNav', () => {
  it('renders all primary navigation links', () => {
    render(
      <MemoryRouter>
        <SideNav />
      </MemoryRouter>,
    );
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Defect Dashboard' })).toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(6);
  });

  it('marks the link for the active route and leaves the others inactive', () => {
    render(
      <MemoryRouter initialEntries={['/defect-dashboard']}>
        <SideNav />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: 'Defect Dashboard' })).toHaveClass(
      'app-sidenav__link--active',
    );
    expect(screen.getByRole('link', { name: 'Dashboard' })).not.toHaveClass(
      'app-sidenav__link--active',
    );
  });
});
