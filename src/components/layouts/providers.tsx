import { NextSSRPlugin } from '@uploadthing/react/next-ssr-plugin';
import { Analytics } from '@vercel/analytics/react';
import { ThemeProvider } from 'next-themes';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { Toaster } from 'sonner';
import { extractRouterConfig } from 'uploadthing/server';
import { oliviaFileRouter } from '~/app/api/uploadthing/core';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" enableSystem disableTransitionOnChange>
      <NextSSRPlugin
        /**
         * The `extractRouterConfig` will extract **only** the route configs
         * from the router to prevent additional information from being
         * leaked to the client. The data passed to the client is the same
         * as if you were to fetch `/api/uploadthing` directly.
         */
        routerConfig={extractRouterConfig(oliviaFileRouter)}
      />
      <Toaster richColors closeButton theme="system" />
      <NuqsAdapter>{children}</NuqsAdapter>
      <Analytics />
    </ThemeProvider>
  );
}
