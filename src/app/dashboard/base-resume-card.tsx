'use client';

import { FileTextIcon, PencilIcon, UploadIcon } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { BaseResumeEditDialog } from '~/components/resume-pdf/base-resume-edit-dialog';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Resume } from '~/db/schemas/resume';

export function BaseResumeCard({
  baseResume,
}: {
  baseResume: Resume | null;
}) {
  const [editOpen, setEditOpen] = useState(false);

  if (!baseResume) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Base Resume</CardTitle>
          <CardDescription>
            Upload your resume to start tailoring it for jobs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/upload">
              <UploadIcon className="size-4" />
              Upload Resume
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Base Resume</CardTitle>
          <CardDescription>
            Your uploaded resume is ready. Paste job URLs below to generate
            tailored versions.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileTextIcon className="size-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{baseResume.name}</p>
              <p className="text-xs text-muted-foreground">
                Uploaded{' '}
                {new Date(baseResume.createdAt).toLocaleDateString('en-US', {
                  timeZone: 'UTC',
                })}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditOpen(true)}
          >
            <PencilIcon className="size-4" />
            Edit
          </Button>
        </CardContent>
      </Card>

      <BaseResumeEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  );
}
