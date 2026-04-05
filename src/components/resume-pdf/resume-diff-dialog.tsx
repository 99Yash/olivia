'use client';

import { parseDiffFromFile } from '@pierre/diffs';
import { FileDiff } from '@pierre/diffs/react';
import { useMemo } from 'react';
import { ValidatedResumeData } from '~/lib/schemas/resume';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

function formatMonth(month: number | null | undefined): string {
  if (!month) return '';
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return months[month - 1] ?? '';
}

function formatDate(
  d: { month?: number | null; year?: number | null } | null | undefined
): string {
  if (!d?.year) return 'Present';
  const m = formatMonth(d.month);
  return m ? `${m} ${d.year}` : `${d.year}`;
}

function resumeToText(data: ValidatedResumeData): string {
  const lines: string[] = [];

  if (data.full_name) lines.push(data.full_name);

  const contact: string[] = [];
  if (data.email) contact.push(data.email);
  if (data.phone_number) contact.push(data.phone_number);
  if (data.location) contact.push(data.location);
  if (data.website_url) contact.push(data.website_url);
  if (contact.length) lines.push(contact.join(' | '));

  if (data.summary) {
    lines.push('', '## Summary', data.summary);
  }

  if (data.highlights) {
    lines.push('', '## Highlights', data.highlights);
  }

  if (data.experiences?.length) {
    lines.push('', '## Experience');
    for (const exp of data.experiences) {
      for (const pos of exp.positions ?? []) {
        const dateRange = `${formatDate(pos.startsAt)} - ${formatDate(pos.endsAt)}`;
        lines.push(`### ${pos.title ?? ''} at ${exp.company ?? ''}`);
        lines.push(
          `${dateRange}${pos.location ? ` | ${pos.location}` : ''}`
        );
        if (pos.description) {
          lines.push(pos.description);
        }
        lines.push('');
      }
    }
  }

  if (data.education?.length) {
    lines.push('## Education');
    for (const edu of data.education) {
      const degree = [edu.degreeName, edu.fieldOfStudy]
        .filter(Boolean)
        .join(' in ');
      lines.push(`### ${edu.school ?? ''}`);
      if (degree) lines.push(degree);
      lines.push(`${formatDate(edu.startsAt)} - ${formatDate(edu.endsAt)}`);
      lines.push('');
    }
  }

  if (data.projects?.length) {
    lines.push('## Projects');
    for (const proj of data.projects) {
      lines.push(`### ${proj.name ?? ''}`);
      if (proj.description) lines.push(proj.description);
      lines.push(
        `${formatDate(proj.startsAt)} - ${formatDate(proj.endsAt)}`
      );
      lines.push('');
    }
  }

  if (data.skills?.length) {
    lines.push('## Skills');
    for (const cat of data.skills) {
      const label = cat.title ? `${cat.title}: ` : '';
      lines.push(`${label}${cat.skills?.join(', ') ?? ''}`);
    }
    lines.push('');
  }

  if (data.certifications?.length) {
    lines.push('## Certifications');
    for (const cert of data.certifications) {
      lines.push(
        `- ${cert.name ?? ''}${cert.authority ? ` (${cert.authority})` : ''}`
      );
    }
    lines.push('');
  }

  if (data.awards?.length) {
    lines.push('## Awards');
    for (const award of data.awards) {
      lines.push(
        `- ${award.name ?? ''}${award.issuer ? ` — ${award.issuer}` : ''}`
      );
      if (award.description) lines.push(`  ${award.description}`);
    }
    lines.push('');
  }

  if (data.patents?.length) {
    lines.push('## Patents');
    for (const pat of data.patents) {
      lines.push(
        `- ${pat.name ?? ''}${pat.patentNumber ? ` (${pat.patentNumber})` : ''}`
      );
      if (pat.description) lines.push(`  ${pat.description}`);
    }
    lines.push('');
  }

  if (data.languages?.length) {
    lines.push('## Languages');
    for (const lang of data.languages) {
      lines.push(
        `- ${lang.name ?? ''}${lang.proficiency ? ` — ${lang.proficiency}` : ''}`
      );
    }
  }

  return lines.join('\n');
}

const ADDITIONS_ONLY_CSS = `
  [data-line-type='change-deletion'][data-line],
  [data-line-type='change-deletion'][data-no-newline],
  [data-line-type='change-deletion'][data-column-number] {
    display: none !important;
  }
`;

export function ResumeDiffDialog({
  open,
  onOpenChange,
  before,
  after,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  before: ValidatedResumeData | null;
  after: ValidatedResumeData | null;
}) {
  const fileDiff = useMemo(() => {
    if (!before || !after) return null;
    return parseDiffFromFile(
      { name: 'resume.md', contents: resumeToText(before) },
      { name: 'resume.md', contents: resumeToText(after) }
    );
  }, [before, after]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[80vh] w-[700px] max-w-[90vw] flex-col overflow-hidden p-0">
        <DialogHeader className="shrink-0 border-b px-6 py-3">
          <DialogTitle>ATS Optimization Changes</DialogTitle>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-auto">
          {fileDiff && (
            <FileDiff
              fileDiff={fileDiff}
              options={{
                diffStyle: 'unified',
                disableFileHeader: true,
                disableLineNumbers: true,
                diffIndicators: 'none',
                unsafeCSS: ADDITIONS_ONLY_CSS,
              }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
