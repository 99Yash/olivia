import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { auth } from '~/lib/auth/server';
import { getErrorMessage } from '~/lib/errors';
import { companyDesignProfileSchema } from '~/lib/schemas/company-design';
import { discoverCompanyDesignForJob } from '~/lib/services/company-design.service';
import {
  beginJobDesignDiscovery,
  getJobByIdAndUser,
  markJobDesignDiscoveryFailed,
  updateJobDesignProfile,
} from '~/lib/services/job.service';

const REFRESH_COOLDOWN_MS = 60_000;

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

  const profile = companyDesignProfileSchema
    .nullable()
    .safeParse(result.job.designProfile);
  if (!profile.success) {
    return NextResponse.json(
      { error: 'Stored company design profile is invalid.' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    profile: profile.data,
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
  if (result.job.status !== 'complete' || !result.job.content) {
    return NextResponse.json(
      { error: 'Wait until resume tailoring is complete.' },
      { status: 409 }
    );
  }

  const existingProfile = companyDesignProfileSchema.safeParse(
    result.job.designProfile
  );
  if (existingProfile.success) {
    const observedAt = existingProfile.data.accent.evidence[0]?.observedAt;
    if (
      observedAt &&
      Date.now() - new Date(observedAt).getTime() < REFRESH_COOLDOWN_MS
    ) {
      return NextResponse.json(
        { error: 'Wait one minute before checking the public sources again.' },
        { status: 429 }
      );
    }
  }

  const started = await beginJobDesignDiscovery(jobId, result.userId);
  if (!started) {
    return NextResponse.json(
      { error: 'Company design discovery is already in progress.' },
      { status: 409 }
    );
  }

  try {
    const profile = companyDesignProfileSchema.parse(
      await discoverCompanyDesignForJob(result.job)
    );
    await updateJobDesignProfile(jobId, result.userId, profile);
    return NextResponse.json({ profile, jobTitle: result.job.title });
  } catch (error) {
    console.error('Company design discovery failed:', getErrorMessage(error));
    await markJobDesignDiscoveryFailed(jobId, result.userId);
    return NextResponse.json(
      { error: 'Could not find a reliable public design source.' },
      { status: 502 }
    );
  }
}
