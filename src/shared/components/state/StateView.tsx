import type { ReactNode } from 'react';
import type { AppError } from '@shared/types/error';

interface StateViewProps {
  isLoading: boolean;
  isError: boolean;
  isEmpty?: boolean;
  /**
   * Normalized {@link AppError} or a native `Error` (React Query types query
   * errors as `Error`). Only the `message` is rendered.
   */
  error?: AppError | Error | null;
  children: ReactNode;
  loadingLabel?: string;
  emptyLabel?: string;
}

/**
 * Standardizes the four mandatory UI states (loading / error / empty / success)
 * required for every page by the project coding standards.
 */
export const StateView = ({
  isLoading,
  isError,
  isEmpty = false,
  error,
  children,
  loadingLabel = 'Loading…',
  emptyLabel = 'No data available.',
}: StateViewProps): JSX.Element => {
  if (isLoading) {
    return (
      <div role="status" aria-live="polite" className="state-view state-view--loading">
        {loadingLabel}
      </div>
    );
  }

  if (isError) {
    return (
      <div role="alert" className="state-view state-view--error">
        {error?.message ?? 'Something went wrong. Please try again.'}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="state-view state-view--empty" aria-live="polite">
        {emptyLabel}
      </div>
    );
  }

  return <>{children}</>;
};
