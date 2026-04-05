import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { auth } from '~/lib/auth/server';
import { resume_parse_object } from '~/lib/schemas/resume';
import {
  getResumeByJobId,
  updateResumeAnalysis,
} from '~/lib/services/resume.service';

export async function GET(
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
  const resume = await getResumeByJobId(jobId);

  if (!resume || resume.userId !== session.user.id) {
    return NextResponse.json(
      { error: 'Resume not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(resume);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { jobId } = await params;
  const body = await request.json();
  const parsed = resume_parse_object.safeParse(body.analysis);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid analysis data' },
      { status: 400 }
    );
  }

  const updated = await updateResumeAnalysis(
    jobId,
    session.user.id,
    parsed.data
  );

  if (!updated) {
    return NextResponse.json(
      { error: 'Resume not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(updated);
}
