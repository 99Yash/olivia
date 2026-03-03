import { generateObject } from 'ai';
import { z } from 'zod';
import { openai } from '../ai';
import { resume_parse_object, ValidatedResumeData } from '../schemas/resume';

export const verifyResume = async (resumeText: string) => {
  const { object, usage } = await generateObject({
    model: openai('gpt-4o-mini'),
    schema: z.object({
      valid: z
        .boolean()
        .describe('Whether the resume resembles a valid resume'),
    }),
    messages: [
      {
        role: 'system',
        content: `You are a resume judge. You are given a resume text and you need to determine if it resembles a valid resume.`,
      },
      {
        role: 'user',
        content: resumeText,
      },
    ],
  });

  return { valid: object.valid, usage };
};

export const analyzeResume = async (resumeText: string) => {
  const { object, usage } = await generateObject({
    model: openai('gpt-4o-mini'),
    schema: resume_parse_object,
    messages: [
      {
        role: 'system',
        content:
          'You are a resume analyzer. Analyze the provided resume text and extract structured information about the candidate. If a section is not present, return null for that section.',
      },
      {
        role: 'user',
        content: resumeText,
      },
    ],
  });

  return { object, usage };
};

export const verifyJobDescription = async (pageContent: string) => {
  const { object } = await generateObject({
    model: openai('gpt-4o-mini'),
    schema: z.object({
      valid: z
        .boolean()
        .describe(
          'Whether this page content contains a legitimate job posting / job description'
        ),
      reason: z
        .string()
        .describe(
          'Brief reason why this is or is not a valid job posting'
        ),
    }),
    messages: [
      {
        role: 'system',
        content:
          'You are a job posting validator. Determine if the provided page content is a legitimate job posting or job description. A valid job posting typically contains a job title, responsibilities/requirements, and company information.',
      },
      {
        role: 'user',
        content: pageContent,
      },
    ],
  });

  return { valid: object.valid, reason: object.reason };
};

export const tailorResume = async (
  baseResume: ValidatedResumeData,
  jobDescription: string
) => {
  const { object } = await generateObject({
    model: openai('gpt-4o-mini'),
    schema: resume_parse_object,
    messages: [
      {
        role: 'system',
        content: `You are an expert resume tailor. Given a candidate's existing resume and a job description, rewrite the resume to be optimized for this specific job.

Rules:
- Rewrite the summary to highlight relevance to this role
- Reorder and rephrase experience bullet points to emphasize ATS keywords from the job description
- Prioritize skills that match the job requirements
- Keep all factual information accurate — NEVER fabricate experiences, skills, companies, dates, or qualifications
- You may rephrase, reorder, and emphasize, but must not invent anything new
- Preserve the original structure (sections present in the original should remain)
- Omit sections that were null in the original`,
      },
      {
        role: 'user',
        content: `## Base Resume
${JSON.stringify(baseResume, null, 2)}

## Job Description
${jobDescription}`,
      },
    ],
  });

  return object;
};
