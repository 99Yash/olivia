import { db } from '~/db';
import { NewResume, resume as resumeSchema } from '~/db/schemas';

export const addResume = async (resume: NewResume) => {
  const { name, url, jobId, status, analysis, userId } = resume;

  const newResume = await db
    .insert(resumeSchema)
    .values({
      name,
      url,
      jobId,
      status,
      analysis,
      userId,
    })
    .returning();
};
