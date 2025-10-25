import { createRouteHandler } from 'uploadthing/next';

import { oliviaFileRouter } from './core';

export const { GET, POST } = createRouteHandler({
  router: oliviaFileRouter,
  config: {
    logLevel: process.env.NODE_ENV === 'development' ? 'Debug' : 'Error',
    isDev: process.env.NODE_ENV === 'development',
    logFormat: 'pretty',
  },
});
