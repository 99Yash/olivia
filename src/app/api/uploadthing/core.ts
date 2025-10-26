import { format } from 'date-fns';
import { headers } from 'next/headers';
import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';
import { auth } from '~/lib/auth/server';
import { FILE_UPLOAD } from '~/lib/constants';
import { AppError } from '~/lib/errors';
import { analyzeResume, verifyResume } from '~/lib/services/ai.service';
import { addResume } from '~/lib/services/resume.service';

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
  // Resume uploader for PDF, DOC, DOCX files
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

      if (!user)
        throw new AppError({ code: 'UNAUTHORIZED', message: 'Unauthorized' });

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log('Resume upload complete for userId:', metadata.userId);
      console.log('file url', file.ufsUrl);

      const { valid } = await verifyResume(file.ufsUrl);

      if (!valid)
        throw new AppError({
          code: 'NOT_IMPLEMENTED',
          message: 'Invalid resume',
        });

      const { object: analysis } = await analyzeResume(file.ufsUrl);

      console.log('analysis', analysis);

      const resume = await addResume({
        name: `${analysis.full_name} resume ${format(
          new Date(),
          'dd/MM/yyyy'
        )}`,
        url: file.ufsUrl,
        status: 'complete',
        analysis,
        userId: metadata.userId,
        jobId: null, // null for the user's base resume
      });

      console.log('resume added', resume.id);

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OliviaFileRouter = typeof oliviaFileRouter;
