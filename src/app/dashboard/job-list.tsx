'use client';

import { formatDistanceToNow } from 'date-fns';
import {
  BriefcaseIcon,
  ExternalLinkIcon,
  EyeIcon,
  RotateCwIcon,
} from 'lucide-react';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { retryJobAction } from './actions';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '~/components/ui/empty';
import { Spinner } from '~/components/ui/spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { Job } from '~/db/schemas/job';
import { PdfPreviewDialog } from '~/components/resume-pdf/pdf-preview-dialog';

const STATUS_CONFIG: Record<
  Job['status'],
  { label: string; className: string; spinning?: boolean }
> = {
  pending: {
    label: 'Pending',
    className: 'bg-muted text-muted-foreground',
  },
  scraping: {
    label: 'Scraping',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    spinning: true,
  },
  valid: {
    label: 'Valid',
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
  tailoring: {
    label: 'Tailoring',
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    spinning: true,
  },
  complete: {
    label: 'Complete',
    className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  },
  invalid: {
    label: 'Invalid',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
  error: {
    label: 'Error',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
};

function StatusBadge({ status }: { status: Job['status'] }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={config.className}>
      {config.spinning && <Spinner className="size-3" />}
      {config.label}
    </Badge>
  );
}

export function JobList({ jobs }: { jobs: Job[] }) {
  const [previewJobId, setPreviewJobId] = useState<string | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (jobs.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BriefcaseIcon />
          </EmptyMedia>
          <EmptyTitle>No jobs yet</EmptyTitle>
          <EmptyDescription>
            Paste a job listing URL above to start tailoring your resume.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Job</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => (
            <TableRow key={job.id}>
              <TableCell className="max-w-sm">
                <a
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/link flex items-center gap-1.5 truncate font-medium hover:underline"
                >
                  <span className="truncate">
                    {job.title ?? new URL(job.url).hostname}
                  </span>
                  <ExternalLinkIcon className="size-3 shrink-0 opacity-0 transition-opacity group-hover/link:opacity-60" />
                </a>
                {(job.status === 'invalid' || job.status === 'error') &&
                  job.invalidReason && (
                    <div className="mt-1 text-xs text-destructive">
                      {job.invalidReason}
                    </div>
                  )}
              </TableCell>
              <TableCell>
                <StatusBadge status={job.status} />
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {formatDistanceToNow(new Date(job.createdAt), {
                  addSuffix: true,
                })}
              </TableCell>
              <TableCell className="text-right">
                {job.status === 'complete' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPreviewJobId(job.id)}
                  >
                    <EyeIcon className="size-4" />
                    View
                  </Button>
                )}
                {(job.status === 'error' || job.status === 'invalid') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isPending && retryingId === job.id}
                    onClick={() => {
                      setRetryingId(job.id);
                      startTransition(async () => {
                        const result = await retryJobAction(job.id);
                        if ('error' in result) {
                          toast.error(result.error);
                        }
                        setRetryingId(null);
                      });
                    }}
                  >
                    <RotateCwIcon
                      className={`size-4 ${isPending && retryingId === job.id ? 'animate-spin' : ''}`}
                    />
                    Retry
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <PdfPreviewDialog
        jobId={previewJobId}
        open={!!previewJobId}
        onOpenChange={(open) => {
          if (!open) setPreviewJobId(null);
        }}
      />
    </>
  );
}
