import { jsonb, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

export const companyDesignCache = pgTable('company_design_cache', {
  domain: varchar('domain', { length: 255 }).primaryKey(),
  profile: jsonb('profile').notNull(),
  refreshedAt: timestamp('refreshed_at').defaultNow().notNull(),
});
