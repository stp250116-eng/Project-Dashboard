import { render, screen } from '@testing-library/react';
import { Footer } from './Footer';

describe('Footer', () => {
  it('renders the current year and environment version', () => {
    render(<Footer />);
    const year = new Date().getFullYear();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`${year} Enterprise Dashboard`))).toBeInTheDocument();
    expect(screen.getByText('vtest')).toBeInTheDocument();
  });
});
