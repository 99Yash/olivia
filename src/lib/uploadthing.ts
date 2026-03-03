import { UTApi } from 'uploadthing/server';

export const utapi = new UTApi({
  logFormat: 'pretty',
  logLevel: process.env.NODE_ENV === 'development' ? 'Debug' : 'Error',
});
