import { Firecrawl } from '@mendable/firecrawl-js';

export const firecrawl = new Firecrawl({
  apiKey: process.env.FIRECRAWL_API_KEY!,
});

type HiringOrganization = {
  name: string;
  url: string | null;
  jobTitle: string | null;
};

function findJobPosting(value: unknown): Record<string, unknown> | null {
  if (Array.isArray(value)) {
    for (const item of value) {
      const match = findJobPosting(item);
      if (match) return match;
    }
    return null;
  }
  if (!value || typeof value !== 'object') return null;
  const object = value as Record<string, unknown>;
  const type = object['@type'];
  if (
    type === 'JobPosting' ||
    (Array.isArray(type) && type.includes('JobPosting'))
  ) {
    return object;
  }
  for (const child of Object.values(object)) {
    const match = findJobPosting(child);
    if (match) return match;
  }
  return null;
}

export function extractHiringOrganization(
  rawHtml: string | null | undefined
): HiringOrganization | null {
  if (!rawHtml) return null;
  const scripts = rawHtml.matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  );
  for (const script of scripts) {
    try {
      const posting = findJobPosting(JSON.parse(script[1].trim()));
      if (!posting) continue;
      const organization = posting.hiringOrganization;
      if (!organization || typeof organization !== 'object') continue;
      const details = organization as Record<string, unknown>;
      if (typeof details.name !== 'string' || !details.name.trim()) continue;
      const sameAs = Array.isArray(details.sameAs)
        ? details.sameAs.find((item): item is string => typeof item === 'string')
        : details.sameAs;
      const possibleUrl =
        typeof sameAs === 'string'
          ? sameAs
          : typeof details.url === 'string'
            ? details.url
            : null;
      return {
        name: details.name.trim(),
        url: possibleUrl,
        jobTitle:
          typeof posting.title === 'string' ? posting.title.trim() : null,
      };
    } catch {
      // Ignore invalid JSON-LD blocks and continue to the next one.
    }
  }
  return null;
}

export async function scrapeJobPage(url: string) {
  const result = await firecrawl.scrape(url, {
    formats: ['markdown', 'rawHtml', 'links', 'branding'],
    onlyMainContent: true,
    waitFor: 3000,
  });

  return {
    markdown: result.markdown ?? '',
    title: result.metadata?.title ?? null,
    links: result.links ?? [],
    branding: result.branding ?? null,
    hiringOrganization: extractHiringOrganization(result.rawHtml),
  };
}
