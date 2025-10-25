import { headers } from 'next/headers';
import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';
import { auth } from '~/lib/auth/server';
import { FILE_UPLOAD } from '~/lib/constants';

const f = createUploadthing();

const authMiddleware = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new UploadThingError('Unauthorized');

  return { id: session.user.id };
};

// FileRouter for your app, can contain multiple FileRoutes
export const oliviaFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({
    image: {
      /**
       * For full list of options and defaults, see the File Route API reference
       * @see https://docs.uploadthing.com/file-routes#route-config
       */
      maxFileSize: FILE_UPLOAD.SIZE_LIMITS_STRING.IMAGE,
      maxFileCount: FILE_UPLOAD.COUNT_LIMITS.IMAGE,
    },
  })
    // Set permissions and file types for this FileRoute
    .middleware(async () => {
      // This code runs on your server before upload
      const user = await authMiddleware();

      // If you throw, the user will not be able to upload
      if (!user) throw new UploadThingError('Unauthorized');

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log('Upload complete for userId:', metadata.userId);

      console.log('file url', file.ufsUrl);

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedBy: metadata.userId };
    }),

  // Resume uploader for PDF, DOC, DOCX, TXT files
  resumeUploader: f({
    pdf: {
      maxFileSize: FILE_UPLOAD.SIZE_LIMITS_STRING.RESUME,
      maxFileCount: FILE_UPLOAD.COUNT_LIMITS.RESUME,
    },
    'application/msword': {
      maxFileSize: FILE_UPLOAD.SIZE_LIMITS_STRING.RESUME,
      maxFileCount: FILE_UPLOAD.COUNT_LIMITS.RESUME,
    },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
      maxFileSize: FILE_UPLOAD.SIZE_LIMITS_STRING.RESUME,
      maxFileCount: FILE_UPLOAD.COUNT_LIMITS.RESUME,
    },
  })
    // Set permissions and file types for this FileRoute
    .middleware(async () => {
      // This code runs on your server before upload
      const user = await authMiddleware();

      // If you throw, the user will not be able to upload
      if (!user) throw new UploadThingError('Unauthorized');

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log('Resume upload complete for userId:', metadata.userId);

      console.log('file url', file.ufsUrl);

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OliviaFileRouter = typeof oliviaFileRouter;
