/**
 * Application-wide error type. API and integration layers normalize all
 * failures into this shape so the UI never sees raw exceptions.
 */
export interface AppError {
  /** Machine-readable code, e.g. 'NETWORK_ERROR', 'HTTP_404'. */
  code: string;
  /** User-safe, non-sensitive message. */
  message: string;
  /** Optional HTTP status code. */
  status?: number;
  /** Optional correlation id for tracing. */
  correlationId?: string;
}

export const createAppError = (
  code: string,
  message: string,
  status?: number,
  correlationId?: string,
): AppError => ({ code, message, status, correlationId });
