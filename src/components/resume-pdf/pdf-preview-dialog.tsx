'use client';

import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { DownloadIcon } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { ValidatedResumeData } from '~/lib/schemas/resume';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Spinner } from '../ui/spinner';
import { ResumeDocument } from './resume-document';

export function PdfPreviewDialog({
  jobId,
  open,
  onOpenChange,
}: {
  jobId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [resumeData, setResumeData] = useState<ValidatedResumeData | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchResume = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/jobs/${id}/resume`);
      if (!res.ok) {
        setError('Failed to load resume');
        return;
      }
      const data = await res.json();
      setResumeData(data.analysis);
    } catch {
      setError('Failed to load resume');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open && jobId) {
      fetchResume(jobId);
    } else {
      setResumeData(null);
      setError(null);
    }
  }, [open, jobId, fetchResume]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl w-[90vw] h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Tailored Resume Preview</DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0">
          {loading && (
            <div className="flex h-full items-center justify-center">
              <Spinner className="size-6" />
            </div>
          )}

          {error && (
            <div className="flex h-full items-center justify-center text-destructive">
              {error}
            </div>
          )}

          {resumeData && !loading && (
            <PDFViewer
              width="100%"
              height="100%"
              showToolbar={false}
              className="rounded-md border"
            >
              <ResumeDocument data={resumeData} />
            </PDFViewer>
          )}
        </div>

        {resumeData && (
          <DialogFooter>
            <PDFDownloadLink
              document={<ResumeDocument data={resumeData} />}
              fileName="tailored-resume.pdf"
            >
              {({ loading: downloading }) => (
                <Button disabled={downloading} variant="default">
                  <DownloadIcon className="size-4" />
                  {downloading ? 'Preparing...' : 'Download PDF'}
                </Button>
              )}
            </PDFDownloadLink>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
