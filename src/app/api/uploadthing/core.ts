import { headers } from 'next/headers';
import { PDFParse } from 'pdf-parse';
import 'pdf-parse/worker'; // Import worker before pdf-parse for Next.js compatibility
import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';
import { auth } from '~/lib/auth/server';
import { FILE_UPLOAD } from '~/lib/constants';
import { AppError } from '~/lib/errors';
import { analyzeResume, verifyResume } from '~/lib/services/ai.service';
import { addResume } from '~/lib/services/resume.service';
import { utapi } from '~/lib/uploadthing';

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
      const parser = new PDFParse({ url: file.ufsUrl });

      try {
        const data = await parser.getText();

        const { valid } = await verifyResume(data.text);

        if (!valid) {
          await utapi.deleteFiles([file.key]);
          throw new AppError({
            code: 'BAD_REQUEST',
            message:
              'This document does not seem to be a resume. Please upload a valid resume file.',
          });
        }

        const { object: analysis } = await analyzeResume(data.text);

        await addResume({
          name: file.name,
          url: file.ufsUrl,
          status: 'complete',
          analysis,
          userId: metadata.userId,
          jobId: null, // null for the user's base resume
        });

        // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
        return { uploadedBy: metadata.userId };
      } finally {
        await parser.destroy(); // Clean up resources
      }
    }),
} satisfies FileRouter;

export type OliviaFileRouter = typeof oliviaFileRouter;
