import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { auth } from '~/lib/auth/server';
import { discoverCompanyDesign } from '~/lib/services/company-design.service';
import {
  getJobByIdAndUser,
  updateJobDesignProfile,
} from '~/lib/services/job.service';

async function authenticatedJob(jobId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: 'Unauthorized', status: 401 } as const;
  const job = await getJobByIdAndUser(jobId, session.user.id);
  if (!job) return { error: 'Job not found', status: 404 } as const;
  return { job, userId: session.user.id } as const;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const result = await authenticatedJob(jobId);
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({
    profile: result.job.designProfile,
    jobTitle: result.job.title,
  });
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const result = await authenticatedJob(jobId);
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  if (!result.job.content) {
    return NextResponse.json(
      { error: 'The job listing has not been analyzed yet.' },
      { status: 409 }
    );
  }

  try {
    const profile = await discoverCompanyDesign(result.job);
    await updateJobDesignProfile(jobId, result.userId, profile);
    return NextResponse.json({ profile, jobTitle: result.job.title });
  } catch {
    return NextResponse.json(
      { error: 'Could not find a reliable public design source.' },
      { status: 502 }
    );
  }
}
