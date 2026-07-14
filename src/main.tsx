import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import '@progress/kendo-theme-default/dist/all.css';
import './app/styles/global.css';
import { AppProviders } from '@app/providers/AppProviders';
import { router } from '@app/router/router';

// Ensure Kendo / Telerik license is registered at startup if present.
// Vite supports importing text files using the `?raw` suffix. The
// project keeps the license file at the repository root as
// `telerik-license.txt` (gitignored). Import it as raw and register
// with the licensing package if available. Avoid top-level await by
// performing the work inside an async IIFE.
(async () => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const licenseRaw = (await import('../telerik-license.txt?raw'))?.default;
    if (licenseRaw) {
      // Import the licensing helper (typed to the expected surface)
      type LicenseModule = { setLicenseKey?: (key: string) => void };
      const licenseMod = (await import('@progress/kendo-licensing')) as unknown as LicenseModule | undefined;
      if (licenseMod && typeof licenseMod.setLicenseKey === 'function') {
        try {
          licenseMod.setLicenseKey(typeof licenseRaw === 'string' ? licenseRaw.trim() : String(licenseRaw));
        } catch {
          // swallow: avoid breaking the app if licensing call fails
        }
      }
    }
  } catch {
    // ignore: license file or licensing package not available in some environments
  }
})();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <AppProviders>
      <RouterProvider router={router} future={{ v7_startTransition: true }} />
    </AppProviders>
  </StrictMode>,
);
