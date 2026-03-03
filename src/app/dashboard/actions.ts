'use server';

import { eq } from 'drizzle-orm';
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

  const [existing] = await db
    .select()
    .from(job)
    .where(eq(job.id, jobId));

  if (!existing || existing.userId !== session.user.id) {
    return { error: 'Job not found' };
  }

  if (existing.status !== 'error' && existing.status !== 'invalid') {
    return { error: 'Only failed jobs can be retried' };
  }

  // Reset job status
  await db
    .update(job)
    .set({ status: 'pending', invalidReason: null })
    .where(eq(job.id, jobId));

  after(async () => {
    await runTailoringWorkflow(jobId, existing.url, existing.userId);
  });

  return { success: true };
}
