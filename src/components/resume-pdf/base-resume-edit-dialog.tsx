'use client';

import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { DiffIcon, DownloadIcon, SparklesIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ValidatedResumeData } from '~/lib/schemas/resume';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Spinner } from '../ui/spinner';
import { Textarea } from '../ui/textarea';
import { ResumeDocument } from './resume-document';
import { ResumeDiffDialog } from './resume-diff-dialog';
import { ResumeEditForm } from './resume-edit-form';

export function BaseResumeEditDialog({
  open,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}) {
  const [originalData, setOriginalData] = useState<ValidatedResumeData | null>(
    null,
  );
  const [editedData, setEditedData] = useState<ValidatedResumeData | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ATS optimization state
  const [jobDescription, setJobDescription] = useState('');
  const [optimizing, setOptimizing] = useState(false);
  const [showOptimize, setShowOptimize] = useState(false);
  const [preOptimizeData, setPreOptimizeData] =
    useState<ValidatedResumeData | null>(null);
  const [showDiff, setShowDiff] = useState(false);

  const fetchResume = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/resume');
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
    if (open) {
      fetchResume();
    } else {
      setOriginalData(null);
      setEditedData(null);
      setError(null);
      setJobDescription('');
      setShowOptimize(false);
      setPreOptimizeData(null);
    }
  }, [open, fetchResume]);

  const isDirty =
    editedData &&
    originalData &&
    JSON.stringify(editedData) !== JSON.stringify(originalData);

  const handleSave = async () => {
    if (!editedData) return;
    setSaving(true);
    try {
      const res = await fetch('/api/resume', {
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
      onSaved?.();
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
    if (!jobDescription.trim()) {
      toast.error('Paste a job description first');
      return;
    }
    setOptimizing(true);
    try {
      const res = await fetch('/api/resume/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription: jobDescription.trim() }),
      });
      if (!res.ok) {
        toast.error('Optimization failed');
        return;
      }
      const data = await res.json();
      setPreOptimizeData(editedData);
      setEditedData(data.analysis);
      setShowOptimize(false);
      setJobDescription('');
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
      <DialogContent className="flex h-[95vh] w-[95vw] max-w-[95vw]! flex-col p-0">
        <DialogHeader className="shrink-0 border-b px-6 py-3">
          <div className="flex items-center justify-between">
            <DialogTitle>Edit Base Resume</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={showOptimize ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setShowOptimize(!showOptimize)}
              >
                <SparklesIcon className="size-4" />
                Optimize for ATS
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
                  <Button variant="ghost" size="sm" onClick={handleDiscard}>
                    Discard
                  </Button>
                  <Button size="sm" disabled={saving} onClick={handleSave}>
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
                  fileName="resume.pdf"
                >
                  {({ loading: downloading }) => (
                    <Button disabled={downloading} variant="outline" size="sm">
                      <DownloadIcon className="size-4" />
                      {downloading ? 'Preparing...' : 'Download'}
                    </Button>
                  )}
                </PDFDownloadLink>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* ATS Optimization Panel */}
        {showOptimize && (
          <motion.div
            className="shrink-0 border-b bg-muted/50 px-6 py-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <p className="mb-2 text-sm font-medium">
              Paste the job description to optimize your resume for ATS
            </p>
            <Textarea
              className="mb-3 min-h-[120px] bg-background"
              placeholder="Paste the full job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              disabled={optimizing}
            />
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                disabled={optimizing || !jobDescription.trim()}
                onClick={handleOptimize}
              >
                {optimizing ? (
                  <>
                    <Spinner className="size-3" />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="size-3" />
                    Optimize
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                Uses AI to rewrite your resume with ATS-friendly keywords from
                the job description
              </p>
            </div>
          </motion.div>
        )}

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
