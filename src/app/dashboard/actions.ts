'use server';

import { and, eq, inArray } from 'drizzle-orm';
import { headers } from 'next/headers';
import { after } from 'next/server';
import { db } from '~/db';
import { job } from '~/db/schemas/job';
import { auth } from '~/lib/auth/server';
import { createJob, getJobByUrlAndUser } from '~/lib/services/job.service';
import { runTailoringWorkflow } from '~/lib/services/workflow.service';

export async function submitJobAction(url: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: 'Unauthorized' };
  }

  const userId = session.user.id;

  // Check for duplicate
  const existing = await getJobByUrlAndUser(url, userId);
  if (existing) {
    return { error: 'You have already submitted this job URL.' };
  }

  const newJob = await createJob({ url, userId });

  // Fire-and-forget the workflow after the response is sent
  after(async () => {
    await runTailoringWorkflow(newJob.id, url, userId);
  });

  return { jobId: newJob.id };
}

export async function retryJobAction(jobId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: 'Unauthorized' };
  }

  const [updated] = await db
    .update(job)
    .set({ status: 'pending', invalidReason: null })
    .where(
      and(
        eq(job.id, jobId),
        eq(job.userId, session.user.id),
        inArray(job.status, ['error', 'invalid'])
      )
    )
    .returning();

  if (!updated) {
    return { error: 'Job not found or cannot be retried' };
  }

  after(async () => {
    await runTailoringWorkflow(jobId, updated.url, updated.userId);
  });

  return { success: true };
}
