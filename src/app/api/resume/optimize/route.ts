import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { auth } from '~/lib/auth/server';
import { optimizeResumeForATS } from '~/lib/services/ai.service';
import { getBaseResume } from '~/lib/services/resume.service';

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  if (!body.jobDescription || typeof body.jobDescription !== 'string') {
    return NextResponse.json(
      { error: 'Missing job description' },
      { status: 400 }
    );
  }

  const base = await getBaseResume(session.user.id);

  if (!base?.analysis) {
    return NextResponse.json(
      { error: 'No base resume found' },
      { status: 404 }
    );
  }

  const optimized = await optimizeResumeForATS(
    base.analysis,
    body.jobDescription
  );

  return NextResponse.json({ analysis: optimized });
}
