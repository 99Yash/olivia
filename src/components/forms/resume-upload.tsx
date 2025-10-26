'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, Upload, X } from 'lucide-react';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';
import { Button } from '~/components/ui/button';
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadItemProgress,
  FileUploadList,
  FileUploadTrigger,
} from '~/components/ui/file-upload';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { useUploadFiles } from '~/hooks/use-uploadthing';
import { FILE_UPLOAD, formatFileSize } from '~/lib/constants';

export const resumeUploadSchema = z.object({
  title: z
    .string()
    .optional()
    .describe('Optional title or description for the resume'),
});

export type ResumeUploadData = z.infer<typeof resumeUploadSchema>;

interface ResumeUploadFormProps {
  className?: React.ComponentProps<'div'>['className'];
}

export function ResumeUploadForm({ className }: ResumeUploadFormProps = {}) {
  const [files, setFiles] = React.useState<File[]>([]);
  const { uploadFiles, isUploading } = useUploadFiles(
    FILE_UPLOAD.ENDPOINTS.RESUME
  );

  const form = useForm<ResumeUploadData>({
    resolver: zodResolver(resumeUploadSchema),
    defaultValues: {
      title: '',
    },
  });

  const onFileReject = React.useCallback((file: File, message: string) => {
    toast(message, {
      description: `"${
        file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name
      }" has been rejected`,
    });
  }, []);

  const onAccept = React.useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
  }, []);

  const onSubmit = React.useCallback(async () => {
    if (files.length === 0) {
      toast.error('Please select a resume file');
      return;
    }

    // Trigger the upload
    try {
      const res = await uploadFiles(files);

      toast.success('Resume uploaded successfully!', {
        description: (
          <pre className="mt-2 w-80 rounded-md bg-accent/30 p-4 text-accent-foreground">
            <code>
              {JSON.stringify(
                res.map((file) =>
                  file.name.length > 25
                    ? `${file.name.slice(0, 25)}...`
                    : file.name
                ),
                null,
                2
              )}
            </code>
          </pre>
        ),
      });

      // Reset form after successful upload
      form.reset();
      setFiles([]);
    } catch (error) {
      console.error('Upload error:', error);

      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An unknown error occurred during upload');
      }
    }
  }, [files, uploadFiles, form]);

  return (
    <div className={className || ''}>
      <Form {...form}>
        <form className="space-y-8">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">
                  Resume Title (Optional)
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Software Engineer Resume 2024"
                    className="h-11"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-sm">
                  A descriptive title for your resume to help you identify it
                  later
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <label className="text-base font-semibold">Resume File</label>
            <div className="mt-3">
              <FileUpload
                accept={FILE_UPLOAD.TYPES.RESUME.ACCEPT}
                maxFiles={FILE_UPLOAD.COUNT_LIMITS.RESUME}
                maxSize={FILE_UPLOAD.SIZE_LIMITS.RESUME}
                className="w-full"
                onAccept={onAccept}
                onFileReject={onFileReject}
                multiple={false}
                disabled={isUploading}
              >
                <FileUploadDropzone className="min-h-[200px] border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
                  <div className="flex flex-col items-center gap-3 text-center py-4">
                    <div className="flex items-center justify-center rounded-full border-2 border-muted-foreground/20 bg-muted/30 p-4">
                      <FileText className="size-8 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-base">
                        Upload your resume
                      </p>
                      <p className="text-muted-foreground text-sm">
                        PDF, DOC, or DOCX files up to{' '}
                        {formatFileSize(FILE_UPLOAD.SIZE_LIMITS.RESUME)}
                      </p>
                    </div>
                  </div>
                  <FileUploadTrigger asChild>
                    <Button variant="outline" className="mt-4">
                      <Upload className="mr-2 h-4 w-4" />
                      Choose file
                    </Button>
                  </FileUploadTrigger>
                </FileUploadDropzone>
                <FileUploadList className="mt-4">
                  {files.map((file, index) => (
                    <FileUploadItem
                      key={index}
                      value={file}
                      className="border-2"
                    >
                      <div className="flex w-full items-center gap-3">
                        <FileUploadItemPreview className="size-12" />
                        <div className="flex-1 min-w-0">
                          <FileUploadItemMetadata size="sm" />
                        </div>
                        <FileUploadItemDelete asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 shrink-0 hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <X className="size-4" />
                          </Button>
                        </FileUploadItemDelete>
                      </div>
                      <FileUploadItemProgress className="mt-3 h-2" />
                    </FileUploadItem>
                  ))}
                </FileUploadList>
              </FileUpload>
            </div>
            <div className="bg-muted/30 rounded-lg p-4 mt-4">
              <p className="text-muted-foreground text-sm">
                Your resume will be processed and analyzed to create an
                optimized version
              </p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button
              type="submit"
              disabled={isUploading || files.length === 0}
              className="w-full h-12 text-base font-medium"
              onClick={onSubmit}
            >
              {isUploading ? (
                <>
                  <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Uploading Resume...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-5 w-5" />
                  Upload Resume
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
