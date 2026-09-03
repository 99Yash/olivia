import { z } from 'zod';

export const designConfidenceSchema = z.enum(['high', 'medium', 'low']);
export const companyDesignStatusSchema = z.enum([
  'idle',
  'discovering',
  'complete',
  'error',
]);
export const designSourceKindSchema = z.enum([
  'official-design-system',
  'official-brand-guide',
  'official-company-page',
  'job-page',
]);
export const typographyCharacterSchema = z.enum([
  'modern',
  'humanist',
  'editorial',
  'technical',
  'traditional',
]);

const hexColorSchema = z.string().regex(/^#[0-9a-f]{6}$/i);
const evidenceSchema = z.object({
  url: z.url(),
  sourceKind: designSourceKindSchema,
  observedAt: z.string().datetime(),
  note: z.string().min(1),
});

export const companyDesignProfileSchema = z.object({
  companyName: z.string().min(1),
  officialUrl: z.url().nullable(),
  identityConfidence: designConfidenceSchema,
  accent: z.object({
    observed: hexColorSchema.nullable(),
    applied: hexColorSchema,
    confidence: designConfidenceSchema,
    evidence: z.array(evidenceSchema).min(1).max(4),
    transformation: z.string().min(1).optional(),
  }),
  typography: z.object({
    observed: z.object({
      headingFamily: z.string().min(1).nullable(),
      bodyFamily: z.string().min(1).nullable(),
      character: typographyCharacterSchema,
    }),
    applied: z.object({
      safeFamily: z.enum(['Roboto', 'Times-Roman']),
      character: typographyCharacterSchema,
    }),
    confidence: designConfidenceSchema,
    evidence: z.array(evidenceSchema).min(1).max(4),
    transformation: z.string().min(1).optional(),
  }),
  spacingUnit: z.object({
    observed: z.number().finite().min(1).max(32).nullable(),
    applied: z.number().finite().min(4).max(8),
    confidence: designConfidenceSchema,
    evidence: z.array(evidenceSchema).min(1).max(4),
    transformation: z.string().min(1).optional(),
  }),
  overallConfidence: designConfidenceSchema,
  warnings: z.array(z.string().min(1)).max(6),
});

export const companyDesignResponseSchema = z.object({
  profile: companyDesignProfileSchema.nullable(),
  jobTitle: z.string().nullable(),
  status: companyDesignStatusSchema,
});

export type DesignConfidence = z.infer<typeof designConfidenceSchema>;
export type CompanyDesignStatus = z.infer<typeof companyDesignStatusSchema>;
export type DesignSourceKind = z.infer<typeof designSourceKindSchema>;
export type TypographyCharacter = z.infer<typeof typographyCharacterSchema>;
export type CompanyDesignProfile = z.infer<
  typeof companyDesignProfileSchema
>;
