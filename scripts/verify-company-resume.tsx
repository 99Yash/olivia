import { mkdir } from 'node:fs/promises';
import { renderToFile } from '@react-pdf/renderer';
import { ResumeDocument } from '../src/components/resume-pdf/resume-document';
import type { CompanyDesignProfile } from '../src/lib/schemas/company-design';
import type { ValidatedResumeData } from '../src/lib/schemas/resume';

const output = 'tmp/pdfs/company-resume-check.pdf';

const profile: CompanyDesignProfile = {
  companyName: 'Northstar',
  targetRole: 'Product Design Engineer',
  source: {
    url: 'https://example.com/design',
    label: 'Northstar Design System',
    kind: 'public-design-system',
  },
  confidence: 'high',
  colors: {
    primary: '#194f46',
    secondary: '#8db9a8',
    text: '#14201d',
    muted: '#53645f',
    background: '#ffffff',
  },
  typography: {
    headingFamily: 'Source Serif 4',
    bodyFamily: 'Inter',
    character: 'editorial',
  },
  evidence: [
    {
      signal: 'color',
      observed: '#3a806e',
      applied: '#194f46',
      sourceUrl: 'https://example.com/design',
      confidence: 'high',
    },
  ],
  traits: ['Editorial voice', 'Crisp geometry'],
  rationale: 'A deterministic ATS-safe test profile.',
  discoveredAt: new Date().toISOString(),
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
  console.log(output);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
