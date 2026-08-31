import { and, desc, eq, lt, ne, or } from 'drizzle-orm';
import { db } from '~/db';
import { Job, job, NewJob } from '~/db/schemas/job';
import {
  CompanyDesignProfile,
  companyDesignProfileSchema,
} from '~/lib/schemas/company-design';

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

export async function updateJobDesignProfile(
  jobId: string,
  userId: string,
  designProfile: CompanyDesignProfile | null
) {
  const validatedProfile = companyDesignProfileSchema
    .nullable()
    .parse(designProfile);
  const [updated] = await db
    .update(job)
    .set({
      designProfile: validatedProfile,
      designStatus: validatedProfile ? 'complete' : 'idle',
    })
    .where(and(eq(job.id, jobId), eq(job.userId, userId)))
    .returning();
  return updated ?? null;
}

export async function beginJobDesignDiscovery(
  jobId: string,
  userId: string
) {
  const staleDiscoveryTime = new Date(Date.now() - 2 * 60 * 1_000);
  const [updated] = await db
    .update(job)
    .set({ designStatus: 'discovering' })
    .where(
      and(
        eq(job.id, jobId),
        eq(job.userId, userId),
        or(
          ne(job.designStatus, 'discovering'),
          lt(job.updatedAt, staleDiscoveryTime)
        )
      )
    )
    .returning();
  return updated ?? null;
}

export async function markJobDesignDiscoveryFailed(
  jobId: string,
  userId: string
) {
  const [updated] = await db
    .update(job)
    .set({ designStatus: 'error' })
    .where(and(eq(job.id, jobId), eq(job.userId, userId)))
    .returning();
  return updated ?? null;
}

export async function getJobByIdAndUser(jobId: string, userId: string) {
  const [existing] = await db
    .select()
    .from(job)
    .where(and(eq(job.id, jobId), eq(job.userId, userId)));
  return existing ?? null;
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
