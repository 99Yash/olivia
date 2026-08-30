import { getErrorMessage } from '../errors';
import { tailorResume, verifyJobDescription } from './ai.service';
import { updateJobDesignProfile, updateJobStatus } from './job.service';
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
    const { markdown, title, links, branding, hiringOrganization } =
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
    const designPromise = discoverCompanyDesign({
      url,
      title,
      content: markdown,
      links,
      jobPageBranding: branding,
      hiringOrganization,
    })
      .then((profile) => updateJobDesignProfile(jobId, userId, profile))
      .catch(() => null);
    const [tailored] = await Promise.all([
      tailorResume(baseResume.analysis, markdown),
      designPromise,
    ]);

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
  } catch (error) {
    const message = getErrorMessage(error);
    await updateJobStatus(jobId, 'error', { invalidReason: message });
  }
}
