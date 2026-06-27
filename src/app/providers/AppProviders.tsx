import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './queryClient';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Composes all global providers. Add additional context providers (theme,
 * auth, i18n) here so `main.tsx` stays declarative.
 */
export const AppProviders = ({ children }: AppProvidersProps): JSX.Element => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);
