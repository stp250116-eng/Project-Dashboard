import { render, screen } from '@testing-library/react';
import { StateView } from './StateView';

describe('StateView', () => {
  it('renders loading state', () => {
    render(
      <StateView isLoading isError={false}>
        <div>content</div>
      </StateView>,
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders error state with message', () => {
    render(
      <StateView
        isLoading={false}
        isError
        error={{ code: 'X', message: 'Boom' }}
      >
        <div>content</div>
      </StateView>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Boom');
  });

  it('renders empty state', () => {
    render(
      <StateView isLoading={false} isError={false} isEmpty emptyLabel="Nothing here">
        <div>content</div>
      </StateView>,
    );
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('renders children on success', () => {
    render(
      <StateView isLoading={false} isError={false}>
        <div>content</div>
      </StateView>,
    );
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('falls back to a generic message when error is missing', () => {
    render(
      <StateView isLoading={false} isError error={undefined}>
        <div>content</div>
      </StateView>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Something went wrong. Please try again.',
    );
  });
});
