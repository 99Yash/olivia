'use client';

import { generateReactHelpers } from '@uploadthing/react';
import type { ClientUploadedFileData } from 'uploadthing/types';
import { type OliviaFileRouter } from '~/app/api/uploadthing/core';

const { useUploadThing } = generateReactHelpers<OliviaFileRouter>();

type UploadRoute = keyof OliviaFileRouter;

export function useUploadFiles<T extends UploadRoute>(route: T) {
  const { startUpload, isUploading } = useUploadThing(route, {
    onClientUploadComplete: (res: ClientUploadedFileData<unknown>[]) => {
      console.log('Resume upload completed:', res);
    },
    onUploadError: (error: Error) => {
      console.error('Resume upload error:', error);
    },
    onUploadBegin: (fileName: string) => {
      console.log('Resume upload started:', fileName);
    },
  });

  const uploadFiles = async (files: File[]) => {
    try {
      // @ts-expect-error - UploadThing type inference issue with mixed shorthand and MIME types
      const res = await startUpload(files);

      if (!res) {
        throw new Error('Upload failed');
      }

      return res.map((file: ClientUploadedFileData<unknown>) => ({
        name: file.name,
        url: file.ufsUrl,
      }));
    } catch (error) {
      throw error;
    }
  };

  return {
    uploadFiles,
    isUploading,
  };
}
