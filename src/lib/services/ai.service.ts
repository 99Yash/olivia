import { generateObject, generateText } from 'ai';
import { openai } from '../ai';
import { resume_parse_object } from '../schemas/resume';

export const verifyResume = async (resumeUrl: string) => {
  const { text, usage } = await generateText({
    model: openai('gpt-4o-mini'),
    prompt: `Adjudicate the resume at ${resumeUrl} for being a valid resume. Return 0 if invalid, 1 if valid.`,
  });

  return { text, usage };
};

export const analyzeResume = async (resumeUrl: string) => {
  const { object, usage } = await generateObject({
    model: openai('gpt-4o-mini'),
    schema: resume_parse_object,
    prompt: `Analyze the resume at ${resumeUrl} and return the data.`,
  });

  return { object, usage };
};
