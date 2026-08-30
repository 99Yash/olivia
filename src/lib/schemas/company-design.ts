import { z } from 'zod';

const hexColor = z.string().regex(/^#[0-9a-f]{6}$/i);

export const companyDesignProfileSchema = z.object({
  companyName: z.string().min(1),
  targetRole: z.string().nullable(),
  source: z.object({
    url: z.url(),
    label: z.string().min(1),
    kind: z.enum(['public-design-system', 'company-site', 'job-page']),
  }),
  confidence: z.enum(['high', 'medium', 'low']),
  colors: z.object({
    primary: hexColor,
    secondary: hexColor.nullable(),
    text: hexColor,
    muted: hexColor,
    background: hexColor,
  }),
  typography: z.object({
    headingFamily: z.string().nullable(),
    bodyFamily: z.string().nullable(),
    character: z.enum([
      'modern',
      'humanist',
      'editorial',
      'technical',
      'traditional',
    ]),
  }),
  evidence: z
    .array(
      z.object({
        signal: z.enum(['color', 'heading-type', 'body-type', 'spacing']),
        observed: z.string().min(1),
        applied: z.string().min(1),
        sourceUrl: z.url(),
        confidence: z.enum(['high', 'medium', 'low']),
      })
    )
    .max(6),
  traits: z.array(z.string()).max(4),
  rationale: z.string().min(1),
  discoveredAt: z.string().datetime(),
});

export type CompanyDesignProfile = z.infer<
  typeof companyDesignProfileSchema
>;
