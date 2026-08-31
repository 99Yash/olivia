import { Firecrawl } from '@mendable/firecrawl-js';
import type { BrandingProfile, Document, SearchResultWeb } from '@mendable/firecrawl-js';
import { getErrorMessage } from '../errors';

const firecrawl = new Firecrawl({
  apiKey: process.env.FIRECRAWL_API_KEY!,
});

const FIRECRAWL_TIMEOUT_MS = 10_000;

export type HiringOrganization = {
  name: string;
  url: string | null;
};

export type PublicPage = {
  url: string;
  title: string | null;
  description: string | null;
  markdown: string;
  links: string[];
  branding: BrandingProfile | null;
};

export type PublicSearchResult = {
  url: string;
  title: string | null;
  description: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function findJobPosting(value: unknown): Record<string, unknown> | null {
  if (Array.isArray(value)) {
    for (const item of value) {
      const match = findJobPosting(item);
      if (match) return match;
    }
    return null;
  }
  if (!isRecord(value)) return null;
  const object = value;
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
      if (!isRecord(organization)) continue;
      const details = organization;
      if (typeof details.name !== 'string' || !details.name.trim()) continue;
      const sameAs = Array.isArray(details.sameAs)
        ? details.sameAs.find((item): item is string => typeof item === 'string')
        : details.sameAs;
      const possibleUrl =
        typeof details.url === 'string'
          ? details.url
          : typeof sameAs === 'string'
            ? sameAs
            : null;
      return {
        name: details.name.trim(),
        url: possibleUrl,
      };
    } catch (error) {
      console.warn(
        'Ignored an invalid job-page JSON-LD block:',
        getErrorMessage(error)
      );
      // Ignore invalid JSON-LD blocks and continue to the next one.
    }
  }
  return null;
}

export async function scrapeJobPage(url: string) {
  const result = await firecrawl.scrape(url, {
    formats: ['markdown', 'rawHtml', 'links'],
    onlyMainContent: true,
    waitFor: 3000,
    timeout: FIRECRAWL_TIMEOUT_MS,
  });

  return {
    markdown: result.markdown ?? '',
    title: result.metadata?.title ?? null,
    links: result.links ?? [],
    hiringOrganization: extractHiringOrganization(result.rawHtml),
  };
}

function isDocument(value: SearchResultWeb | Document): value is Document {
  return 'metadata' in value || 'markdown' in value || 'branding' in value;
}

export async function searchPublicPages(
  query: string,
  limit = 4
): Promise<PublicSearchResult[]> {
  const result = await firecrawl.search(query, {
    sources: ['web'],
    limit,
    timeout: FIRECRAWL_TIMEOUT_MS,
  });
  return (result.web ?? []).flatMap((item) => {
    const url = isDocument(item) ? item.metadata?.url : item.url;
    if (!url) return [];
    return [
      {
        url,
        title: isDocument(item) ? item.metadata?.title ?? null : item.title ?? null,
        description: isDocument(item)
          ? item.metadata?.description ?? null
          : item.description ?? null,
      },
    ];
  });
}

export async function scrapePublicPage(url: string): Promise<PublicPage> {
  const result = await firecrawl.scrape(url, {
    formats: ['markdown', 'links', 'branding'],
    onlyMainContent: false,
    timeout: FIRECRAWL_TIMEOUT_MS,
    waitFor: 1500,
  });
  return {
    url: result.metadata?.url ?? url,
    title: result.metadata?.title ?? null,
    description: result.metadata?.description ?? null,
    markdown: result.markdown ?? '',
    links: result.links ?? [],
    branding: result.branding ?? null,
  };
}
