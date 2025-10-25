import z from 'zod';

export const resume_parse_object = z.object({
  full_name: z.string().nullable().describe('Full name of the user'),
  phone_number: z.string().nullable().describe('Contact number if present'),
  website_url: z.url().nullable().describe('Website of the user if present'),
  email: z.email().nullable().describe('Email of the user'),
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
    .union([
      // Option 1: Flat array of strings
      z
        .array(z.string().describe('A skill mentioned in the resume'))
        .describe('Flat array of skills extracted from the resume'),
      // Option 2: Array of category objects
      z
        .array(
          z.object({
            title: z
              .string()
              .nullable()
              .describe(
                'Title of the skill sub-category (e.g., Programming Languages, Frameworks)'
              ),
            skills: z
              .array(z.string().describe('A skill within this category'))
              .nullable()
              .describe('Array of skills under this category'),
          })
        )
        .describe(
          'Array of skill categories, each with an optional title and a list of skills'
        ),
    ])
    .nullable()
    .describe(
      'Skills section: either a flat list of skills (string[]) or a list of categories ({title?: string, skills: string[]}[]). Strictly should not be a mix of both.'
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

  references: z
    .array(
      z.object({
        name: z
          .string()
          .nullable()
          .describe('Full name of the reference person'),
        designation: z
          .string()
          .nullable()
          .describe(
            'Job title or position of the reference (e.g., "Senior Software Engineer", "Product Manager")'
          ),
        company: z
          .string()
          .nullable()
          .describe('Company where the reference works, or notable work.'),
        email: z.string().nullable().describe('Email address of the reference'),
        phone: z.string().nullable().describe('Phone number of the reference'),
        testimonial: z
          .string()
          .nullable()
          .describe(
            'What the reference says about the person - their recommendation or testimonial'
          ),
      })
    )
    .nullable()
    .describe(
      "Professional references - people who can vouch for the candidate's skills and character"
    ),

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
  | 'languages'
  | 'references';
