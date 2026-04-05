import { and, desc, eq, isNull } from 'drizzle-orm';
import { db } from '~/db';
import { NewResume, resume as resumeSchema } from '~/db/schemas';

export const addResume = async (resume: NewResume) => {
  const [newResume] = await db
    .insert(resumeSchema)
    .values(resume)
    .returning();

  return newResume;
};

export const getBaseResume = async (userId: string) => {
  const [base] = await db
    .select()
    .from(resumeSchema)
    .where(
      and(
        eq(resumeSchema.userId, userId),
        isNull(resumeSchema.jobId),
        eq(resumeSchema.status, 'complete')
      )
    )
    .orderBy(desc(resumeSchema.createdAt))
    .limit(1);

  return base ?? null;
};

export const getResumeByJobId = async (jobId: string) => {
  const [result] = await db
    .select()
    .from(resumeSchema)
    .where(eq(resumeSchema.jobId, jobId));

  return result ?? null;
};

export const updateResumeAnalysis = async (
  jobId: string,
  userId: string,
  analysis: any
) => {
  const existing = await getResumeByJobId(jobId);
  if (!existing || existing.userId !== userId) return null;

  const [updated] = await db
    .update(resumeSchema)
    .set({ analysis })
    .where(eq(resumeSchema.id, existing.id))
    .returning();

  return updated ?? null;
};
