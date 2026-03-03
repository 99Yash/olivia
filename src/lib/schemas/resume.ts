import z from 'zod';

export const resume_parse_object = z.object({
  full_name: z.string().nullable().describe('Full name of the user'),
  phone_number: z.string().nullable().describe('Contact number if present'),
  website_url: z.string().nullable().describe('Website of the user if present'),
  email: z.string().email().nullable().describe('Email of the user'),
  location: z.string().nullable().describe('Location of the user'),
  summary: z
    .string()
    .nullable()
    .describe('Summary section in the resume as string'),
  highlights: z
    .string()
    .nullable()
    .describe('Highlights or key achievements section in the resume as string'),
  skills: z
    .array(
      z.object({
        title: z
          .string()
          .nullable()
          .describe(
            'Title of the skill sub-category (e.g., Programming Languages, Frameworks). Use null if uncategorized.'
          ),
        skills: z
          .array(z.string().describe('A skill within this category'))
          .describe('Array of skills under this category'),
      })
    )
    .nullable()
    .describe(
      'Skills grouped by category. If the resume lists skills without categories, use a single entry with title: null.'
    ),

  education: z
    .array(
      z.object({
        school: z.string().nullable().describe('Name of the school'),
        degreeName: z
          .string()
          .nullable()
          .describe('Name of the degree - MS, BS, etc.'),
        fieldOfStudy: z.string().nullable().describe('Field of study'),
        startsAt: z
          .object({
            month: z
              .number()
              .nullable()
              .describe('Start month of the education'),
            year: z.number().nullable().describe('Start year of the education'),
          })
          .nullable(),
        endsAt: z
          .object({
            month: z.number().nullable().describe('End month of the education'),
            year: z.number().nullable().describe('End year of the education'),
          })
          .nullable(),
      })
    )
    .nullable()
    .describe('List of education background'),

  experiences: z
    .array(
      z.object({
        company: z.string().nullable().describe('Company name'),
        positions: z.array(
          z.object({
            title: z.string().nullable().describe('Position title'),
            description: z
              .string()
              .nullable()
              .describe('Description of the position'),
            location: z
              .string()
              .nullable()
              .describe('Location of the position'),
            startsAt: z
              .object({
                month: z
                  .number()
                  .nullable()
                  .describe('Start month of the position'),
                year: z
                  .number()
                  .nullable()
                  .describe('Start year of the position'),
              })
              .nullable()
              .describe('Start date of the position'),
            endsAt: z
              .object({
                month: z
                  .number()
                  .nullable()
                  .describe('End month of the position'),
                year: z
                  .number()
                  .nullable()
                  .describe('End year of the position'),
              })
              .nullable(),
          })
        ),
      })
    )
    .nullable()
    .describe('List of work experiences'),

  certifications: z
    .array(
      z.object({
        authority: z
          .string()
          .nullable()
          .describe('The issuer of the certification'),
        name: z.string().nullable().describe('Name of the certification'),
        url: z.string().nullable().describe('URL to the certification'),
        issuedAt: z
          .object({
            month: z
              .number()
              .nullable()
              .describe('Issue month of the certification'),
            year: z
              .number()
              .nullable()
              .describe('Issue year of the certification'),
          })
          .nullable(),
      })
    )
    .nullable()
    .describe('List of certifications'),

  projects: z
    .array(
      z.object({
        name: z.string().nullable().describe('Name of the project'),
        description: z
          .string()
          .nullable()
          .describe('Description of the project'),
        startsAt: z
          .object({
            month: z.number().nullable().describe('Start month of the project'),
            year: z.number().nullable().describe('Start year of the project'),
          })
          .nullable(),
        endsAt: z
          .object({
            month: z.number().nullable().describe('End month of the project'),
            year: z.number().nullable().describe('End year of the project'),
          })
          .nullable(),
      })
    )
    .nullable()
    .describe('List of projects'),

  awards: z
    .array(
      z.object({
        name: z.string().nullable().describe('Name of the award'),
        description: z.string().nullable().describe('Description of the award'),
        issuer: z
          .string()
          .nullable()
          .describe('Issuer of the award, if present.'),
        issuedAt: z
          .object({
            month: z.number().nullable().describe('Issue month of the award'),
            year: z.number().nullable().describe('Issue year of the award'),
          })
          .nullable(),
      })
    )
    .nullable()
    .describe('List of awards'),

  patents: z
    .array(
      z.object({
        name: z.string().nullable().describe('Title of the patent'),
        description: z
          .string()
          .nullable()
          .describe('Description of the patent'),
        patentNumber: z.string().nullable().describe('Patent number'),
        url: z.string().nullable().describe('URL to the patent'),
        issuedAt: z
          .object({
            month: z.number().nullable().describe('Issue month of the patent'),
            year: z.number().nullable().describe('Issue year of the patent'),
          })
          .nullable(),
      })
    )
    .nullable()
    .describe('List of patents'),

  languages: z
    .array(
      z.object({
        name: z.string().nullable().describe('Name of the language'),
        proficiency: z
          .string()
          .nullable()
          .describe('Proficiency level of the language'),
      })
    )
    .nullable()
    .describe('List of languages spoken by the user'),
});

export type ValidatedResumeData = z.infer<typeof resume_parse_object>;

type SkillCategory = { title: string | null; skills: string[] };

/** Normalize legacy flat string[] skills into categorized format */
export function normalizeSkills(
  skills: ValidatedResumeData['skills'] | string[] | null
): SkillCategory[] | null {
  if (!skills || skills.length === 0) return skills as SkillCategory[] | null;
  if (typeof skills[0] === 'string') {
    return [{ title: null, skills: skills as string[] }];
  }
  return skills as SkillCategory[];
}

export type SectionKey =
  | 'summary'
  | 'highlights'
  | 'experiences'
  | 'education'
  | 'projects'
  | 'skills'
  | 'certifications'
  | 'awards'
  | 'patents'
  | 'languages';
