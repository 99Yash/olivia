'use client';

import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { DiffIcon, DownloadIcon, SparklesIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ValidatedResumeData } from '~/lib/schemas/resume';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Spinner } from '../ui/spinner';
import { ResumeDiffDialog } from './resume-diff-dialog';
import { ResumeDocument } from './resume-document';
import { ResumeEditForm } from './resume-edit-form';

export function ResumeEditDialog({
  jobId,
  open,
  onOpenChange,
}: {
  jobId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [originalData, setOriginalData] =
    useState<ValidatedResumeData | null>(null);
  const [editedData, setEditedData] =
    useState<ValidatedResumeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [optimizing, setOptimizing] = useState(false);
  const [preOptimizeData, setPreOptimizeData] =
    useState<ValidatedResumeData | null>(null);
  const [showDiff, setShowDiff] = useState(false);

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
      setOriginalData(data.analysis);
      setEditedData(data.analysis);
    } catch {
      setError('Failed to load resume');
      setOriginalData(null);
      setEditedData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open && jobId) {
      fetchResume(jobId);
    } else {
      setOriginalData(null);
      setEditedData(null);
      setError(null);
      setPreOptimizeData(null);
    }
  }, [open, jobId, fetchResume]);

  const isDirty =
    editedData &&
    originalData &&
    JSON.stringify(editedData) !== JSON.stringify(originalData);

  const handleSave = async () => {
    if (!jobId || !editedData) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}/resume`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysis: editedData }),
      });
      if (!res.ok) {
        toast.error('Failed to save resume');
        return;
      }
      setOriginalData(editedData);
      toast.success('Resume saved');
    } catch {
      toast.error('Failed to save resume');
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    if (originalData) {
      setEditedData(originalData);
      toast.success('Changes discarded');
    }
  };

  const handleOptimize = async () => {
    if (!jobId) return;
    setOptimizing(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}/resume/optimize`, {
        method: 'POST',
      });
      if (!res.ok) {
        toast.error('Optimization failed');
        return;
      }
      const data = await res.json();
      setPreOptimizeData(editedData);
      setEditedData(data.analysis);
      setShowDiff(true);
      toast.success('Resume optimized for ATS');
    } catch {
      toast.error('Optimization failed');
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <>
    <ResumeDiffDialog
      open={showDiff}
      onOpenChange={setShowDiff}
      before={preOptimizeData}
      after={editedData}
    />
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[95vh] w-[95vw] !max-w-[95vw] flex-col p-0">
        <DialogHeader className="shrink-0 border-b px-6 py-3">
          <div className="flex items-center justify-between">
            <DialogTitle>Edit Resume</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={optimizing || !editedData}
                onClick={handleOptimize}
              >
                {optimizing ? (
                  <>
                    <Spinner className="size-3" />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="size-4" />
                    Optimize for ATS
                  </>
                )}
              </Button>
              {preOptimizeData && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDiff(true)}
                >
                  <DiffIcon className="size-4" />
                  View Changes
                </Button>
              )}
              {isDirty && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDiscard}
                  >
                    Discard
                  </Button>
                  <Button
                    size="sm"
                    disabled={saving}
                    onClick={handleSave}
                  >
                    {saving ? (
                      <>
                        <Spinner className="size-3" />
                        Saving...
                      </>
                    ) : (
                      'Save'
                    )}
                  </Button>
                </>
              )}
              {editedData && !isDirty && (
                <PDFDownloadLink
                  document={<ResumeDocument data={editedData} />}
                  fileName="tailored-resume.pdf"
                >
                  {({ loading: downloading }) => (
                    <Button
                      disabled={downloading}
                      variant="outline"
                      size="sm"
                    >
                      <DownloadIcon className="size-4" />
                      {downloading ? 'Preparing...' : 'Download'}
                    </Button>
                  )}
                </PDFDownloadLink>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex min-h-0 flex-1">
          {loading && (
            <div className="flex flex-1 items-center justify-center">
              <Spinner className="size-6" />
            </div>
          )}

          {error && (
            <div className="flex flex-1 items-center justify-center text-destructive">
              {error}
            </div>
          )}

          {editedData && !loading && !error && (
            <>
              {/* Left: Edit form */}
              <motion.div
                className="w-1/2 shrink-0 overflow-hidden border-r"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <ResumeEditForm
                  resumeData={editedData}
                  onChange={setEditedData}
                />
              </motion.div>

              {/* Right: Live PDF preview */}
              <motion.div
                className="flex flex-1 items-start justify-center overflow-hidden p-3"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 30,
                  delay: 0.05,
                }}
              >
                <PDFViewer
                  width="100%"
                  height="100%"
                  showToolbar={false}
                  className="rounded-md border"
                >
                  <ResumeDocument data={editedData} />
                </PDFViewer>
              </motion.div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
