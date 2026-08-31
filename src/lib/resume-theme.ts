import type {
  CompanyDesignProfile,
  DesignConfidence,
  DesignSourceKind,
  TypographyCharacter,
} from './schemas/company-design';

const STANDARD_ACCENT = '#059669';
const COMPANY_ACCENT_FALLBACK = '#4f46e5';
const NORMAL_TEXT_MIN_CONTRAST = 4.5;
const DARKENING_FACTOR = 0.82;
const MAX_DARKENING_STEPS = 8;

export type ResumeTheme = {
  variant: 'standard' | 'company-informed';
  accent: string;
  foreground: string;
  mutedForeground: string;
  muted: string;
  background: string;
  link: string;
  headingFont: 'Roboto' | 'Times-Roman';
  bodyFont: 'Roboto';
  pagePadding: number;
  headerRuleHeight: number;
  headerMarginTop: number;
  headerMarginBottom: number;
  descriptionLineHeight: number;
  sectionTitleColor: string;
};

type SignalEvidence = {
  url: string;
  sourceKind: DesignSourceKind;
  observedAt: string;
  note: string;
};

type ObservedDesignSignals = {
  accent: string | null;
  headingFamily: string | null;
  bodyFamily: string | null;
  character: TypographyCharacter;
  spacingUnit: number | null;
  confidence: {
    accent: DesignConfidence;
    typography: DesignConfidence;
    spacing: DesignConfidence;
  };
  evidence: {
    accent: SignalEvidence[];
    typography: SignalEvidence[];
    spacing: SignalEvidence[];
  };
};

function relativeLuminance(hex: string): number {
  const channels = [1, 3, 5].map((offset) => {
    const channel = Number.parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastAgainstWhite(hex: string): number {
  return 1.05 / (relativeLuminance(hex) + 0.05);
}

function adjustAccentForTextContrast(hex: string) {
  let applied = hex;
  let steps = 0;
  while (
    steps < MAX_DARKENING_STEPS &&
    contrastAgainstWhite(applied) < NORMAL_TEXT_MIN_CONTRAST
  ) {
    const channels = [1, 3, 5].map((offset) =>
      Math.round(
        Number.parseInt(applied.slice(offset, offset + 2), 16) *
          DARKENING_FACTOR
      )
    );
    applied = `#${channels
      .map((channel) => channel.toString(16).padStart(2, '0'))
      .join('')}`;
    steps += 1;
  }
  return {
    applied,
    transformation:
      applied === hex
        ? undefined
        : `Darkened ${hex} to ${applied} to meet the ${NORMAL_TEXT_MIN_CONTRAST}:1 text contrast requirement.`,
  };
}

function clampSpacingUnit(value: number | null): 4 | 8 {
  if (value === null) return 4;
  return value >= 6 ? 8 : 4;
}

export function deriveAppliedDesignSignals(
  signals: ObservedDesignSignals
): Pick<CompanyDesignProfile, 'accent' | 'typography' | 'spacingUnit'> {
  const rawAccent = signals.accent ?? COMPANY_ACCENT_FALLBACK;
  const accent = adjustAccentForTextContrast(rawAccent);
  const safeFamily =
    signals.confidence.typography === 'high' &&
    ['editorial', 'traditional'].includes(signals.character)
      ? 'Times-Roman'
      : 'Roboto';
  const appliedSpacing = clampSpacingUnit(signals.spacingUnit);

  return {
    accent: {
      observed: signals.accent,
      applied: accent.applied,
      confidence: signals.confidence.accent,
      evidence: signals.evidence.accent,
      transformation:
        accent.transformation ??
        (signals.accent
          ? undefined
          : `No verified accent was found; applied the restrained fallback ${COMPANY_ACCENT_FALLBACK}.`),
    },
    typography: {
      observed: {
        headingFamily: signals.headingFamily,
        bodyFamily: signals.bodyFamily,
        character: signals.character,
      },
      applied: {
        safeFamily,
        character: signals.character,
      },
      confidence: signals.confidence.typography,
      evidence: signals.evidence.typography,
      transformation: `Mapped public font signals to ${safeFamily}; no external font is embedded.`,
    },
    spacingUnit: {
      observed: signals.spacingUnit,
      applied: appliedSpacing,
      confidence: signals.confidence.spacing,
      evidence: signals.evidence.spacing,
      transformation:
        signals.spacingUnit === appliedSpacing
          ? undefined
          : `Clamped the observed spacing to an ATS-safe ${appliedSpacing}-point rhythm.`,
    },
  };
}

export function deriveResumeTheme(
  profile?: CompanyDesignProfile | null
): ResumeTheme {
  if (!profile) {
    return {
      variant: 'standard',
      accent: STANDARD_ACCENT,
      foreground: '#000000',
      mutedForeground: '#333333',
      muted: '#7d817b',
      background: '#ffffff',
      link: '#3d58e1',
      headingFont: 'Roboto',
      bodyFont: 'Roboto',
      pagePadding: 24,
      headerRuleHeight: 3,
      headerMarginTop: 5,
      headerMarginBottom: 5,
      descriptionLineHeight: 1.25,
      sectionTitleColor: STANDARD_ACCENT,
    };
  }

  return {
    variant: 'company-informed',
    accent: profile.accent.applied,
    foreground: '#111827',
    mutedForeground: '#4b5563',
    muted: '#4b5563',
    background: '#ffffff',
    link: profile.accent.applied,
    headingFont: profile.typography.applied.safeFamily,
    bodyFont: 'Roboto',
    pagePadding: Math.min(32, 24 + profile.spacingUnit.applied),
    headerRuleHeight: 1.5,
    headerMarginTop: 10,
    headerMarginBottom: 12,
    descriptionLineHeight: 1.35,
    sectionTitleColor: '#111827',
  };
}
