import { generateObject } from 'ai';
import { z } from 'zod';
import { openai } from '../ai';
import { resume_parse_object } from '../schemas/resume';

export const verifyResume = async (resumeUrl: string) => {
  const { object, usage } = await generateObject({
    model: openai('gpt-4o-mini'),
    schema: z.object({
      valid: z.boolean().describe('Whether the resume is valid'),
    }),
    prompt: `Adjudicate the resume at ${resumeUrl} for being a resume, not some other file. Return true if valid, false if invalid. Nothing else.`,
  });

  return { valid: object.valid, usage };
};

export const analyzeResume = async (resumeUrl: string) => {
  const { object, usage } = await generateObject({
    model: openai('gpt-4o-mini'),
    schema: resume_parse_object,
    prompt: `Analyze the resume at ${resumeUrl} and return the data.`,
  });

  return { object, usage };
};
