import { generateText, Output } from 'ai';
import { z } from 'zod';
import { google, openai } from '../ai';
import { resume_parse_object, ValidatedResumeData } from '../schemas/resume';

export const verifyResume = async (resumeText: string) => {
  const { output, usage } = await generateText({
    model: openai('gpt-4o-mini'),
    output: Output.object({
      schema: z.object({
        valid: z
          .boolean()
          .describe('Whether the resume resembles a valid resume'),
      }),
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

  return { valid: output!.valid, usage };
};

export const analyzeResume = async (resumeText: string) => {
  const { output, usage } = await generateText({
    model: openai('gpt-4o-mini'),
    output: Output.object({
      schema: resume_parse_object,
    }),
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

  return { object: output!, usage };
};

export const verifyJobDescription = async (pageContent: string) => {
  const { output } = await generateText({
    model: openai('gpt-4o-mini'),
    output: Output.object({
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

  return { valid: output!.valid, reason: output!.reason };
};

export const tailorResume = async (
  baseResume: ValidatedResumeData,
  jobDescription: string
) => {
  const { output } = await generateText({
    model: openai('gpt-4o-mini'),
    output: Output.object({
      schema: resume_parse_object,
    }),
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

  return output!;
};

export const optimizeResumeForATS = async (
  baseResume: ValidatedResumeData,
  jobDescription: string
) => {
  const { output } = await generateText({
    model: google('gemini-2.5-flash-lite'),
    output: Output.object({
      schema: resume_parse_object,
    }),
    messages: [
      {
        role: 'system',
        content: `You are an expert ATS (Applicant Tracking System) optimizer. Given a candidate's resume and a job description, rewrite the resume so it scores as high as possible on ATS screening.

Your optimization strategy:
1. **Keyword injection**: Identify critical keywords and phrases from the job description (skills, tools, certifications, job-specific terminology) and naturally weave them into the resume — especially in the summary, experience descriptions, and skills sections.
2. **Summary rewrite**: Craft a targeted professional summary that mirrors the job title and core requirements using exact phrasing from the posting.
3. **Experience bullet points**: Rephrase each bullet to lead with strong action verbs, include measurable results where possible, and incorporate relevant ATS keywords. Reorder bullets so the most relevant ones appear first for each position.
4. **Skills alignment**: Reorder and rephrase skill categories to prioritize exact matches with the job description. Use the same terminology the job posting uses (e.g., if they say "CI/CD" don't write "continuous integration").
5. **Section ordering**: Keep all sections but ensure the most ATS-relevant content appears prominently.

Strict rules:
- NEVER fabricate experiences, skills, companies, dates, degrees, or qualifications
- NEVER add skills or experiences the candidate does not have
- You may rephrase, reorder, emphasize, and restructure — but all content must be truthful
- Preserve all dates, company names, school names, and degree names exactly
- Sections that were null in the original must remain null`,
      },
      {
        role: 'user',
        content: `## Resume
${JSON.stringify(baseResume, null, 2)}

## Target Job Description
${jobDescription}`,
      },
    ],
  });

  return output!;
};
