import { eq } from 'drizzle-orm';
import { db } from '~/db';
import { companyDesignCache } from '~/db/schemas/company-design-cache';
import {
  companyDesignProfileSchema,
  type CompanyDesignProfile,
} from '../schemas/company-design';

const CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1_000;

export function companyDomain(url: string): string {
  return new URL(url).hostname.toLowerCase().replace(/^www\./, '');
}

export async function getCachedCompanyDesignProfile(domain: string) {
  const [cached] = await db
    .select()
    .from(companyDesignCache)
    .where(eq(companyDesignCache.domain, domain));
  if (
    !cached ||
    Date.now() - cached.refreshedAt.getTime() > CACHE_MAX_AGE_MS
  ) {
    return null;
  }
  const parsed = companyDesignProfileSchema.safeParse(cached.profile);
  return parsed.success ? parsed.data : null;
}

export async function cacheCompanyDesignProfile(
  profile: CompanyDesignProfile
) {
  if (!profile.officialUrl || profile.overallConfidence === 'low') return;
  const domain = companyDomain(profile.officialUrl);
  await db
    .insert(companyDesignCache)
    .values({ domain, profile, refreshedAt: new Date() })
    .onConflictDoUpdate({
      target: companyDesignCache.domain,
      set: { profile, refreshedAt: new Date() },
    });
}
