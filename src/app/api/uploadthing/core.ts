import { format } from 'date-fns';
import { headers } from 'next/headers';
import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';
import { auth } from '~/lib/auth/server';
import { FILE_UPLOAD } from '~/lib/constants';
import { AppError } from '~/lib/errors';
import { analyzeResume } from '~/lib/services/ai.service';
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
    .middleware(async () => {
      const user = await authMiddleware();

      if (!user)
        throw new AppError({ code: 'UNAUTHORIZED', message: 'Unauthorized' });

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // const { valid } = await verifyResume(file.ufsUrl);

      // if (!valid) {
      //   await utapi.deleteFiles([file.ufsUrl]);
      //   throw new AppError({
      //     code: 'BAD_REQUEST',
      //     message:
      //       'This document does not seem to be a resume. Please upload a valid resume file.',
      //   });
      // }

      const { object: analysis } = await analyzeResume(file.ufsUrl);

      await addResume({
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

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OliviaFileRouter = typeof oliviaFileRouter;
