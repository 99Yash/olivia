import { mkdir } from 'node:fs/promises';
import { renderToFile } from '@react-pdf/renderer';
import { ResumeDocument } from '../src/components/resume-pdf/resume-document';
import { getErrorMessage } from '../src/lib/errors';
import { deriveAppliedDesignSignals } from '../src/lib/resume-theme';
import type { CompanyDesignProfile } from '../src/lib/schemas/company-design';
import type { ValidatedResumeData } from '../src/lib/schemas/resume';
import { verifyPdfTextOrder } from './verify-pdf-text';

const output = 'tmp/pdfs/company-resume-check.pdf';

const appliedSignals = deriveAppliedDesignSignals({
  accent: '#3a806e',
  headingFamily: 'Source Serif 4',
  bodyFamily: 'Inter',
  character: 'editorial',
  spacingUnit: 8,
  confidence: {
    accent: 'high',
    typography: 'high',
    spacing: 'high',
  },
  evidence: {
    accent: [{
      url: 'https://example.com/design',
      sourceKind: 'official-design-system',
      observedAt: new Date().toISOString(),
      note: 'Deterministic color verification fixture.',
    }],
    typography: [{
      url: 'https://example.com/design',
      sourceKind: 'official-design-system',
      observedAt: new Date().toISOString(),
      note: 'Deterministic typography verification fixture.',
    }],
    spacing: [{
    url: 'https://example.com/design',
    sourceKind: 'official-design-system',
    observedAt: new Date().toISOString(),
      note: 'Deterministic spacing verification fixture.',
    }],
  },
});

const profile: CompanyDesignProfile = {
  companyName: 'Northstar',
  officialUrl: 'https://example.com',
  identityConfidence: 'high',
  ...appliedSignals,
  overallConfidence: 'high',
  warnings: [],
};

const resume: ValidatedResumeData = {
  full_name: 'Alex Morgan',
  phone_number: '+1 555 0100',
  website_url: 'alexmorgan.dev',
  email: 'alex@example.com',
  location: 'New York, NY',
  summary: null,
  highlights: null,
  experiences: [
    {
      company: 'Atlas Labs',
      positions: [
        {
          title: 'Senior Design Engineer',
          description: null,
          location: 'New York, NY',
          startsAt: { month: 3, year: 2022 },
          endsAt: null,
        },
      ],
    },
  ],
  education: [
    {
      school: 'State University',
      degreeName: 'B.S.',
      fieldOfStudy: 'Computer Science',
      startsAt: { month: 8, year: 2014 },
      endsAt: { month: 5, year: 2018 },
    },
  ],
  skills: [
    {
      title: 'Design engineering',
      skills: ['React', 'TypeScript', 'Design systems', 'Accessibility'],
    },
  ],
  projects: null,
  certifications: null,
  awards: null,
  patents: null,
  languages: null,
};

async function main() {
  await mkdir('tmp/pdfs', { recursive: true });
  await renderToFile(
    <ResumeDocument data={resume} designProfile={profile} />,
    output
  );
  try {
    await verifyPdfTextOrder(output, resume);
  } catch (error) {
    console.warn(
      `Company-informed PDF failed text verification; using the standard design. ${getErrorMessage(error)}`
    );
    await renderToFile(<ResumeDocument data={resume} />, output);
    await verifyPdfTextOrder(output, resume);
  }
  console.log(output);
}

main().catch((error) => {
  console.error(getErrorMessage(error));
  process.exitCode = 1;
});
