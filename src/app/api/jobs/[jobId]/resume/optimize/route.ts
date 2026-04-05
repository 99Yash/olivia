import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { db } from '~/db';
import { job } from '~/db/schemas/job';
import { auth } from '~/lib/auth/server';
import { optimizeResumeForATS } from '~/lib/services/ai.service';
import { getResumeByJobId } from '~/lib/services/resume.service';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { jobId } = await params;

  const [jobRecord] = await db
    .select()
    .from(job)
    .where(eq(job.id, jobId));

  if (!jobRecord || jobRecord.userId !== session.user.id) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  if (!jobRecord.content) {
    return NextResponse.json(
      { error: 'Job has no scraped content' },
      { status: 400 }
    );
  }

  const resume = await getResumeByJobId(jobId);

  if (!resume?.analysis) {
    return NextResponse.json(
      { error: 'No resume found for this job' },
      { status: 404 }
    );
  }

  const optimized = await optimizeResumeForATS(
    resume.analysis,
    jobRecord.content
  );

  return NextResponse.json({ analysis: optimized });
}
