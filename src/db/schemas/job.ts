import { relations } from 'drizzle-orm';
import {
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  varchar,
} from 'drizzle-orm/pg-core';
import type { CompanyDesignProfile } from '~/lib/schemas/company-design';
import { user } from './auth';
import { createId, lifecycle_dates } from './helpers';
import { resume } from './resume';

export const jobStatusEnum = pgEnum('job_status', [
  'pending',
  'scraping',
  'valid',
  'tailoring',
  'complete',
  'invalid',
  'error',
]);

export const job = pgTable(
  'job',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    url: varchar('url').notNull(),
    title: varchar('title'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    status: jobStatusEnum('status').default('pending').notNull(),
    content: text('content'),
    designProfile: jsonb('design_profile').$type<CompanyDesignProfile>(),
    analyzedAt: timestamp('analyzed_at'),
    invalidReason: text('invalid_reason'),
    ...lifecycle_dates,
  },
  (t) => [unique().on(t.url, t.userId)]
);

export const jobRelations = relations(job, ({ one, many }) => ({
  user: one(user, {
    fields: [job.userId],
    references: [user.id],
  }),
  resumes: many(resume),
}));

export type Job = typeof job.$inferSelect;
export type NewJob = typeof job.$inferInsert;
