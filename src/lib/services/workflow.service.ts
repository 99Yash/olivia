import { getErrorMessage } from '../errors';
import { tailorResume, verifyJobDescription } from './ai.service';
import {
  beginJobDesignDiscovery,
  markJobDesignDiscoveryFailed,
  updateJobDesignProfile,
  updateJobStatus,
} from './job.service';
import { addResume, getBaseResume } from './resume.service';
import { scrapeJobPage } from './scrape.service';
import { discoverCompanyDesign } from './company-design.service';

export async function runTailoringWorkflow(
  jobId: string,
  url: string,
  userId: string
) {
  try {
    // 1. Scraping
    await updateJobStatus(jobId, 'scraping');
    const { markdown, title, links, hiringOrganization } =
      await scrapeJobPage(url);

    // 2. Validate job description
    const { valid, reason } = await verifyJobDescription(markdown);
    if (!valid) {
      await updateJobStatus(jobId, 'invalid', { invalidReason: reason });
      return;
    }

    // 3. Mark valid, store content + title
    await updateJobStatus(jobId, 'valid', {
      content: markdown,
      title,
      analyzedAt: new Date(),
    });

    // 4. Get base resume
    const baseResume = await getBaseResume(userId);
    if (!baseResume) {
      await updateJobStatus(jobId, 'error', {
        invalidReason: 'No base resume found. Please upload a resume first.',
      });
      return;
    }

    // 5. Tailor resume
    await updateJobStatus(jobId, 'tailoring');
    const tailored = await tailorResume(baseResume.analysis, markdown);

    // 6. Store tailored resume
    await addResume({
      name: `Tailored - ${title ?? url}`,
      url: baseResume.url,
      jobId,
      status: 'complete',
      analysis: tailored,
      userId,
    });

    // 7. Complete
    await updateJobStatus(jobId, 'complete');

    // 8. Discover optional design data after the resume is available.
    const designDiscoveryStarted = await beginJobDesignDiscovery(jobId, userId);
    if (!designDiscoveryStarted) return;
    try {
      const profile = await discoverCompanyDesign({
        url,
        title,
        content: markdown,
        links,
        hiringOrganization,
      });
      await updateJobDesignProfile(jobId, userId, profile);
    } catch (error) {
      console.error(
        'Company design discovery failed after tailoring:',
        getErrorMessage(error)
      );
      await markJobDesignDiscoveryFailed(jobId, userId);
    }
  } catch (error) {
    const message = getErrorMessage(error);
    await updateJobStatus(jobId, 'error', { invalidReason: message });
  }
}
