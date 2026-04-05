import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { auth } from '~/lib/auth/server';
import {
  getBaseResume,
  updateBaseResumeAnalysis,
} from '~/lib/services/resume.service';

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const resume = await getBaseResume(session.user.id);

  if (!resume) {
    return NextResponse.json(
      { error: 'No base resume found' },
      { status: 404 }
    );
  }

  return NextResponse.json(resume);
}

export async function PATCH(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  if (!body.analysis) {
    return NextResponse.json(
      { error: 'Missing analysis data' },
      { status: 400 }
    );
  }

  const updated = await updateBaseResumeAnalysis(
    session.user.id,
    body.analysis
  );

  if (!updated) {
    return NextResponse.json(
      { error: 'No base resume found' },
      { status: 404 }
    );
  }

  return NextResponse.json(updated);
}
