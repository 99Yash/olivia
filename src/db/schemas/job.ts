import { relations } from 'drizzle-orm';
import { pgEnum, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { createId, lifecycle_dates } from './helpers';
import { resume } from './resume';

export const jobStatusEnum = pgEnum('job_status', [
  'pending',
  'valid',
  'invalid',
  'error',
]);

export const job = pgTable('job', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  url: varchar('url').notNull().unique(),
  status: jobStatusEnum('status').default('pending').notNull(),
  content: text('content'),
  analyzedAt: timestamp('analyzed_at'),
  invalidReason: text('invalid_reason'),
  ...lifecycle_dates,
});

export const jobRelations = relations(job, ({ many }) => ({
  resumes: many(resume),
}));
