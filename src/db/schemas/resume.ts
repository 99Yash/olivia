import { relations } from 'drizzle-orm';
import { jsonb, pgEnum, pgTable, text, varchar } from 'drizzle-orm/pg-core';
import { ValidatedResumeData } from '~/lib/schemas/resume';
import { user } from './auth';
import { createId, lifecycle_dates } from './helpers';
import { job } from './job';

export const resumeStatusEnum = pgEnum('resume_status', [
  'pending',
  'complete',
  'error',
]);

export const resume = pgTable('resume', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  name: varchar('name').notNull(),
  url: varchar('url').notNull(),
  jobId: text('job_id').references(() => job.id, { onDelete: 'cascade' }), // null for the user's base resume
  status: resumeStatusEnum('status').default('pending').notNull(),
  analysis: jsonb('analysis').$type<ValidatedResumeData>().notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  ...lifecycle_dates,
});

export const resumeRelations = relations(resume, ({ one }) => ({
  job: one(job, {
    fields: [resume.jobId],
    references: [job.id],
  }),
  user: one(user, {
    fields: [resume.userId],
    references: [user.id],
  }),
}));

export type Resume = typeof resume.$inferSelect;
export type NewResume = typeof resume.$inferInsert;
