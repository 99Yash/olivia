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
import { useUploadFiles } from '~/lib/uploadthing';

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

export function ResumeUploadForm({ className }: ResumeUploadFormProps) {
  const [files, setFiles] = React.useState<File[]>([]);
  const { uploadFiles, isUploading } = useUploadFiles('resumeUploader');

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
    <div className={className}>
      <Form {...form}>
        <form className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Resume Title (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Software Engineer Resume 2024"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  A descriptive title for your resume to help you identify it
                  later
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Resume File
            </label>
            <div className="mt-2">
              <FileUpload
                accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                maxFiles={1}
                maxSize={10 * 1024 * 1024}
                className="w-full max-w-md"
                onAccept={onAccept}
                onFileReject={onFileReject}
                multiple={false}
                disabled={isUploading}
              >
                <FileUploadDropzone>
                  <div className="flex flex-col items-center gap-1 text-center">
                    <div className="flex items-center justify-center rounded-full border p-2.5">
                      <FileText className="size-6 text-muted-foreground" />
                    </div>
                    <p className="font-medium text-sm">Upload your resume</p>
                    <p className="text-muted-foreground text-xs">
                      PDF, DOC, or DOCX files up to 10MB
                    </p>
                  </div>
                  <FileUploadTrigger asChild>
                    <Button variant="outline" size="sm" className="mt-2 w-fit">
                      <Upload className="mr-2 h-4 w-4" />
                      Choose file
                    </Button>
                  </FileUploadTrigger>
                </FileUploadDropzone>
                <FileUploadList>
                  {files.map((file, index) => (
                    <FileUploadItem key={index} value={file}>
                      <div className="flex w-full items-center gap-2">
                        <FileUploadItemPreview />
                        <FileUploadItemMetadata />
                        <FileUploadItemDelete asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7"
                          >
                            <X />
                          </Button>
                        </FileUploadItemDelete>
                      </div>
                      <FileUploadItemProgress />
                    </FileUploadItem>
                  ))}
                </FileUploadList>
              </FileUpload>
            </div>
            <p className="text-muted-foreground text-sm mt-2">
              Your resume will be processed and analyzed to create an optimized
              version
            </p>
          </div>

          <Button
            type="submit"
            disabled={isUploading || files.length === 0}
            className="w-full"
            onClick={onSubmit}
          >
            {isUploading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Uploading Resume...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Resume
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
