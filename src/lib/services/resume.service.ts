import { db } from '~/db';
import { NewResume, resume as resumeSchema } from '~/db/schemas';

export const addResume = async (resume: NewResume) => {
  const [newResume] = await db
    .insert(resumeSchema)
    .values(resume)
    .returning();

  return newResume;
};
