import FirecrawlApp from '@mendable/firecrawl-js';

const firecrawl = new FirecrawlApp({
  apiKey: process.env.FIRECRAWL_API_KEY!,
});

export async function scrapeJobPage(url: string) {
  const result = await firecrawl.scrape(url, {
    formats: ['markdown'],
    onlyMainContent: true,
    waitFor: 3000,
  });

  return {
    markdown: result.markdown ?? '',
    title: result.metadata?.title ?? null,
  };
}
