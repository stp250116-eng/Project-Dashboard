import { AxiosError } from 'axios';
import type { AppError } from '@shared/types/error';
import { createAppError } from '@shared/types/error';
import { LoggerService } from '@shared/services/logger';

/**
 * Normalizes any thrown value (Axios errors, native errors, unknowns) into a
 * user-safe {@link AppError}. Raw exception messages are never surfaced to the UI.
 */
export const apiErrorHandler = (error: unknown): AppError => {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const correlationId =
      (error.response?.headers?.['x-correlation-id'] as string | undefined) ?? undefined;

    if (error.code === 'ERR_NETWORK') {
      LoggerService.error('Network error while calling API', { url: error.config?.url });
      return createAppError(
        'NETWORK_ERROR',
        'Unable to reach the server. Please check your connection and try again.',
        status,
        correlationId,
      );
    }

    if (status === 401) {
      return createAppError('UNAUTHORIZED', 'Your session has expired. Please sign in again.', 401, correlationId);
    }

    if (status === 403) {
      return createAppError('FORBIDDEN', 'You do not have permission to view this resource.', 403, correlationId);
    }

    if (status === 404) {
      return createAppError('NOT_FOUND', 'The requested resource could not be found.', 404, correlationId);
    }

    if (status && status >= 500) {
      LoggerService.error('Server error', { status, url: error.config?.url });
      return createAppError('SERVER_ERROR', 'Something went wrong on our side. Please try again later.', status, correlationId);
    }

    return createAppError(
      `HTTP_${status ?? 'UNKNOWN'}`,
      'An unexpected error occurred while processing your request.',
      status,
      correlationId,
    );
  }

  LoggerService.error('Unhandled non-Axios error', { error: String(error) });
  return createAppError('UNKNOWN_ERROR', 'An unexpected error occurred.');
};
