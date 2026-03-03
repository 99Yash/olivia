import { and, desc, eq } from 'drizzle-orm';
import { db } from '~/db';
import { Job, job, NewJob } from '~/db/schemas/job';

export async function createJob(data: Pick<NewJob, 'url' | 'userId'>) {
  const [newJob] = await db.insert(job).values(data).returning();
  return newJob;
}

export async function updateJobStatus(
  jobId: string,
  status: Job['status'],
  extras?: Partial<Pick<Job, 'content' | 'title' | 'invalidReason' | 'analyzedAt'>>
) {
  const [updated] = await db
    .update(job)
    .set({ status, ...extras })
    .where(eq(job.id, jobId))
    .returning();
  return updated;
}

export async function getJobsByUser(userId: string) {
  return db
    .select()
    .from(job)
    .where(eq(job.userId, userId))
    .orderBy(desc(job.createdAt));
}

export async function getJobByUrlAndUser(url: string, userId: string) {
  const [existing] = await db
    .select()
    .from(job)
    .where(and(eq(job.url, url), eq(job.userId, userId)));
  return existing ?? null;
}
