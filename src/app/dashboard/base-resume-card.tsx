import { FileTextIcon, UploadIcon } from 'lucide-react';
import Link from 'next/link';
import { Resume } from '~/db/schemas/resume';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';

export function BaseResumeCard({
  baseResume,
}: {
  baseResume: Resume | null;
}) {
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
    <Card>
      <CardHeader>
        <CardTitle>Base Resume</CardTitle>
        <CardDescription>
          Your uploaded resume is ready. Paste job URLs below to generate
          tailored versions.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-3">
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
      </CardContent>
    </Card>
  );
}
