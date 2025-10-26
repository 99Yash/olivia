'use client';

import { generateReactHelpers } from '@uploadthing/react';
import type { ClientUploadedFileData } from 'uploadthing/types';
import { type OliviaFileRouter } from '~/app/api/uploadthing/core';

const { useUploadThing } = generateReactHelpers<OliviaFileRouter>();

type UploadRoute = keyof OliviaFileRouter;

export function useUploadFiles<T extends UploadRoute>(route: T) {
  const { startUpload, isUploading } = useUploadThing(route, {
    onClientUploadComplete: () => {
      // Upload completed
    },
    onUploadError: () => {
      // Upload error
    },
    onUploadBegin: () => {
      // Upload started
    },
  });

  const uploadFiles = async (files: File[]) => {
    // @ts-expect-error - UploadThing type inference issue with mixed shorthand and MIME types
    const res = await startUpload(files);

    if (!res) {
      throw new Error('Upload failed');
    }

    return res.map((file: ClientUploadedFileData<unknown>) => ({
      name: file.name,
      url: file.ufsUrl,
    }));
  };

  return {
    uploadFiles,
    isUploading,
  };
}
