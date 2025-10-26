import { generateObject } from 'ai';
import { z } from 'zod';
import { openai } from '../ai';
import { resume_parse_object } from '../schemas/resume';

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
