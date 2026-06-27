import { render, screen } from '@testing-library/react';
import { Header } from './Header';

describe('Header', () => {
  it('renders the application name and signed-in indicator', () => {
    render(<Header />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByText('Enterprise Dashboard')).toBeInTheDocument();
    expect(screen.getByLabelText('Current user')).toHaveTextContent('Signed in');
  });
});
