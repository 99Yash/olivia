'use server';

import { headers } from 'next/headers';
import { after } from 'next/server';
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
