/* eslint-disable no-console */
/**
 * LoggerService — the single approved logging mechanism for the application.
 * Direct usage of `console.*` is forbidden by the project coding standards;
 * always log through this service so output can be routed/silenced centrally.
 */
import { env } from '@shared/config/env';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  timestamp: string;
}

export interface Logger {
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
}

const isDev = env.MODE !== 'production';

const emit = (level: LogLevel, message: string, context?: Record<string, unknown>): void => {
  const entry: LogEntry = {
    level,
    message,
    context,
    timestamp: new Date().toISOString(),
  };

  // In production this should be wired to a real sink (App Insights, Sentry…).
  // The console fallback below is the ONLY sanctioned console usage.
  if (level === 'error') {
    console.error(`[${entry.timestamp}] ${message}`, context ?? '');
  } else if (level === 'warn') {
    console.warn(`[${entry.timestamp}] ${message}`, context ?? '');
  } else if (isDev) {
    console.info(`[${entry.timestamp}] [${level}] ${message}`, context ?? '');
  }
};

export const LoggerService: Logger = {
  debug: (message, context) => emit('debug', message, context),
  info: (message, context) => emit('info', message, context),
  warn: (message, context) => emit('warn', message, context),
  error: (message, context) => emit('error', message, context),
};
