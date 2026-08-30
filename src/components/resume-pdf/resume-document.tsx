'use client';

import {
  Document,
  Font,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';
import { format } from 'date-fns';
import { HtmlToPdf } from '~/lib/html-to-pdf';
import type { CompanyDesignProfile } from '~/lib/schemas/company-design';
import { ValidatedResumeData, normalizeSkills } from '~/lib/schemas/resume';

Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5WZLCzYlKw.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlvAx05IsDqlA.ttf',
      fontWeight: 700,
    },
    {
      src: 'https://fonts.gstatic.com/s/roboto/v30/KFOkCnqEu92Fr1Mu52xPKTM1K9nz.ttf',
      fontWeight: 400,
      fontStyle: 'italic',
    },
    {
      src: 'https://fonts.gstatic.com/s/roboto/v30/KFOjCnqEu92Fr1Mu51TzBhc9AMX6lJBP.ttf',
      fontWeight: 700,
      fontStyle: 'italic',
    },
  ],
});

const FONT_SIZES = {
  LARGE: 10,
  MEDIUM: 9,
  SMALL: 8.5,
};

type ResumeTheme = {
  accent: string;
  foreground: string;
  mutedForeground: string;
  muted: string;
  background: string;
  link: string;
  headingFont: string;
  companyStyle: boolean;
};

function resolveTheme(profile?: CompanyDesignProfile | null): ResumeTheme {
  if (!profile) {
    return {
      accent: '#059669',
      foreground: '#000000',
      mutedForeground: '#333333',
      muted: '#7d817b',
      background: '#ffffff',
      link: '#3d58e1',
      headingFont: 'Roboto',
      companyStyle: false,
    };
  }
  const editorial = ['editorial', 'traditional'].includes(
    profile.typography.character
  );
  return {
    accent: profile.colors.primary,
    foreground: profile.colors.text,
    mutedForeground: profile.colors.muted,
    muted: profile.colors.muted,
    background: '#ffffff',
    link: profile.colors.primary,
    headingFont: editorial ? 'Times-Roman' : 'Roboto',
    companyStyle: true,
  };
}

function createStyles(theme: ResumeTheme) {
  return StyleSheet.create({
  page: {
    paddingTop: theme.companyStyle ? 30 : 24,
    paddingRight: theme.companyStyle ? 30 : 24,
    paddingBottom: theme.companyStyle ? 30 : 24,
    paddingLeft: theme.companyStyle ? 30 : 24,
    backgroundColor: theme.background,
    flexDirection: 'column',
    fontFamily: 'Roboto',
  },
  headerBar: {
    width: '100%',
    height: theme.companyStyle ? 1.5 : 3,
    backgroundColor: theme.accent,
    marginTop: theme.companyStyle ? 10 : 5,
    marginBottom: theme.companyStyle ? 12 : 5,
  },
  name: {
    fontSize: 24,
    fontFamily: theme.headingFont,
    fontWeight: 700,
    color: theme.foreground,
    textAlign: 'left',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  contactInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    fontSize: FONT_SIZES.MEDIUM,
    color: theme.mutedForeground,
  },
  companyHeader: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 2,
  },
  companyRole: {
    fontSize: 11,
    color: theme.mutedForeground,
    fontFamily: 'Roboto',
    marginTop: 1,
  },
  companyContact: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    fontSize: FONT_SIZES.SMALL,
    color: theme.mutedForeground,
    lineHeight: 1.35,
    textAlign: 'left',
  },
  description: {
    fontSize: FONT_SIZES.MEDIUM,
    color: theme.mutedForeground,
    lineHeight: theme.companyStyle ? 1.35 : 1.25,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.LARGE,
    fontFamily: theme.headingFont,
    fontWeight: 700,
    color: theme.companyStyle ? theme.foreground : theme.accent,
    textTransform: 'uppercase',
    letterSpacing: theme.companyStyle ? 0.9 : 0,
    width: '100%',
    marginTop: 3,
    marginBottom: 3,
  },
  itemHeader: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 4,
  },
  itemTitle: {
    fontSize: FONT_SIZES.MEDIUM,
    fontFamily: 'Roboto',
    fontWeight: 700,
    color: theme.foreground,
  },
  dates: {
    fontSize: FONT_SIZES.MEDIUM,
    color: theme.foreground,
    fontFamily: 'Roboto',
    fontWeight: 700,
    alignSelf: 'flex-end',
  },
  location: {
    fontSize: FONT_SIZES.MEDIUM,
    color: theme.muted,
    alignSelf: 'flex-end',
    fontFamily: 'Roboto',
    fontStyle: 'italic',
  },
  itemSubtitle: {
    fontSize: FONT_SIZES.MEDIUM,
    fontFamily: 'Roboto',
    fontStyle: 'italic',
    color: theme.mutedForeground,
    marginTop: 2,
  },
  sectionItemContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  sidebarTitle: {
    fontSize: FONT_SIZES.MEDIUM,
    fontFamily: 'Roboto',
    fontWeight: 700,
    color: theme.foreground,
  },
  skillsList: {
    fontSize: FONT_SIZES.MEDIUM,
    flex: 1,
    color: theme.mutedForeground,
    fontFamily: 'Roboto',
  },
  sidebarText: {
    fontSize: FONT_SIZES.MEDIUM,
    color: theme.foreground,
    lineHeight: 1.4,
  },
  sidebarSubtitle: {
    fontSize: FONT_SIZES.MEDIUM,
    color: theme.mutedForeground,
    lineHeight: 1.4,
  },
  });
}

function formatDate(
  date: { month?: number | null; year?: number | null } | null | undefined
) {
  if (!date?.year) return '';
  if (!date.month) return `${date.year}`;
  return format(new Date(date.year, date.month - 1), 'MMM yyyy');
}

function formatDateRange(
  startsAt:
    | { month?: number | null; year?: number | null }
    | null
    | undefined,
  endsAt:
    | { month?: number | null; year?: number | null }
    | null
    | undefined
): string | null {
  const start = formatDate(startsAt);
  const end = formatDate(endsAt);
  if (!start && !end) return null;
  if (!start && end) return end;
  if (start && !end) return `${start} - Present`;
  return `${start} - ${end}`;
}

function normalizeUrlForHref(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://${url}`;
}

export function ResumeDocument({
  data,
  designProfile,
}: {
  data: ValidatedResumeData;
  designProfile?: CompanyDesignProfile | null;
}) {
  const theme = resolveTheme(designProfile);
  const styles = createStyles(theme);
  return (
    <Document title={`${data.full_name ?? 'Resume'}`}>
      <Page size="A4" style={styles.page}>
        {theme.companyStyle ? (
          <View style={styles.companyHeader}>
            <View>
              {data.full_name && <Text style={styles.name}>{data.full_name}</Text>}
              {designProfile?.targetRole && (
                <Text style={styles.companyRole}>{designProfile.targetRole}</Text>
              )}
            </View>
            <View style={styles.companyContact}>
              {data.location && <Text>{data.location}</Text>}
              {data.phone_number && (
                <>
                  {data.location && <Text>•</Text>}
                  <Text>{String(data.phone_number)}</Text>
                </>
              )}
              {data.email && (
                <>
                  {(data.phone_number || data.location) && <Text>•</Text>}
                  <Text>{data.email}</Text>
                </>
              )}
              {data.website_url && (
                <>
                  {(data.phone_number || data.email || data.location) && (
                    <Text>•</Text>
                  )}
                  <Link
                    style={{ color: theme.link, textDecoration: 'none' }}
                    src={normalizeUrlForHref(data.website_url)}
                  >
                    {data.website_url}
                  </Link>
                </>
              )}
            </View>
          </View>
        ) : (
          <>
            {data.full_name && <Text style={styles.name}>{data.full_name}</Text>}
            <View style={styles.contactInfo}>
              {data.location && <Text>{data.location}</Text>}
              {data.phone_number && (
                <>
                  {data.location && <Text>•</Text>}
                  <Text>{String(data.phone_number)}</Text>
                </>
              )}
              {data.email && (
                <>
                  {(data.phone_number || data.location) && <Text>•</Text>}
                  <Text>{data.email}</Text>
                </>
              )}
              {data.website_url && (
                <>
                  {(data.phone_number || data.email || data.location) && (
                    <Text>• </Text>
                  )}
                  <Text>
                    <Link
                      style={{
                        color: theme.link,
                        textDecoration: 'none',
                        fontSize: FONT_SIZES.SMALL,
                      }}
                      src={normalizeUrlForHref(data.website_url)}
                    >
                      {data.website_url}
                    </Link>
                  </Text>
                </>
              )}
            </View>
          </>
        )}
        <View style={styles.headerBar} />

        {/* Summary */}
        {data.summary && (
          <View wrap={false}>
            <HtmlToPdf html={data.summary} style={styles.description} />
          </View>
        )}

        {/* Highlights */}
        {data.highlights && (
          <View wrap={false} style={{ marginTop: 12 }}>
            <Text style={styles.sectionTitle}>Highlights</Text>
            <HtmlToPdf html={data.highlights} style={styles.description} />
          </View>
        )}

        {/* Experience */}
        {data.experiences && data.experiences.length > 0 && (
          <View style={{ marginTop: 12 }}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {data.experiences.map((exp, i) => (
              <View
                key={i}
                break={false}
                style={{
                  ...styles.sectionItemContainer,
                  marginBottom:
                    i === (data.experiences?.length ?? 1) - 1 ? 0 : 5,
                }}
              >
                {exp.positions?.map((pos, j) => (
                  <View key={j} wrap={false}>
                    <View
                      style={{
                        ...styles.itemHeader,
                        marginTop: j === 0 ? 0 : 5,
                      }}
                    >
                      {j === 0 ? (
                        <View style={{ flex: 1, minWidth: 0 }}>
                          <Text
                            style={{ ...styles.itemTitle, flexShrink: 1 }}
                          >
                            {exp.company}
                            {exp.positions?.[0]?.location &&
                              ` | ${exp.positions[0].location}`}
                          </Text>
                          <Text
                            style={{ ...styles.itemTitle, flexShrink: 1 }}
                          >
                            {pos.title}
                          </Text>
                        </View>
                      ) : (
                        <View style={{ flex: 1, minWidth: 0 }}>
                          <Text
                            style={{ ...styles.itemTitle, flexShrink: 1 }}
                          >
                            {pos.title}
                          </Text>
                        </View>
                      )}
                      <View
                        style={{ alignItems: 'flex-end', flexShrink: 0 }}
                      >
                        <Text style={styles.dates}>
                          {formatDateRange(pos.startsAt, pos.endsAt)}
                        </Text>
                      </View>
                    </View>
                    {pos.description && (
                      <View style={{ marginTop: 1 }}>
                        <HtmlToPdf html={pos.description} style={styles.description} />
                      </View>
                    )}
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {data.education && data.education.length > 0 && (
          <View wrap={false} style={{ marginTop: 12 }}>
            <Text style={styles.sectionTitle}>Education</Text>
            {data.education.map((edu, i) => (
              <View
                key={i}
                break={false}
                style={{
                  ...styles.sectionItemContainer,
                  marginBottom:
                    i === (data.education?.length ?? 1) - 1 ? 0 : 6,
                }}
              >
                <View style={styles.itemHeader} break={false}>
                  <View style={{ flex: 1, minWidth: 0, flexShrink: 1 }}>
                    <Text style={styles.itemTitle}>
                      {edu.school ?? ''}
                    </Text>
                    <Text style={styles.itemSubtitle}>
                      {edu.degreeName
                        ? `${edu.degreeName}${edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}`
                        : (edu.fieldOfStudy ?? '')}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', flexShrink: 0 }}>
                    <Text style={styles.dates}>
                      {formatDateRange(edu.startsAt, edu.endsAt)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Projects */}
        {data.projects && data.projects.length > 0 && (
          <View style={{ marginTop: 12 }}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {data.projects.map((project, i) => (
              <View
                key={i}
                wrap={false}
                style={{
                  ...styles.sectionItemContainer,
                  marginBottom:
                    i === (data.projects?.length ?? 1) - 1 ? 0 : 6,
                }}
              >
                <View style={styles.itemHeader}>
                  <View style={{ flex: 1, minWidth: 0, flexShrink: 1 }}>
                    <Text style={styles.itemTitle}>{project.name}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', flexShrink: 0 }}>
                    <Text style={styles.dates}>
                      {formatDateRange(project.startsAt, project.endsAt)}
                    </Text>
                  </View>
                </View>
                {project.description && (
                  <View>
                    <HtmlToPdf html={project.description} style={styles.description} />
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {data.skills && data.skills.length > 0 && (
          <View wrap={false} style={{ marginTop: 12 }}>
            <Text style={styles.sectionTitle}>Skills</Text>
            {normalizeSkills(data.skills)?.map((skillCat, i) => (
              <View
                key={i}
                break={false}
                style={{ flexDirection: 'row', flexWrap: 'wrap' }}
              >
                {skillCat.title && (
                  <Text style={{ ...styles.sidebarTitle, marginRight: 4 }}>
                    {skillCat.title}:
                  </Text>
                )}
                <Text style={styles.skillsList}>
                  {skillCat.skills
                    ?.filter((s) => s && s.trim() !== '')
                    .join(', ')}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Certifications */}
        {data.certifications && data.certifications.length > 0 && (
          <View
            wrap={data.certifications.length > 3}
            style={{ marginTop: 12 }}
          >
            <Text style={styles.sectionTitle}>Certifications</Text>
            {data.certifications.map((cert, i) => (
              <View
                key={i}
                wrap={false}
                style={{
                  ...styles.sectionItemContainer,
                  marginBottom:
                    i === (data.certifications?.length ?? 1) - 1 ? 0 : 10,
                }}
              >
                <View style={styles.itemHeader}>
                  <View style={{ flex: 1, minWidth: 0, flexShrink: 1 }}>
                    {cert.url ? (
                      <Link
                        src={normalizeUrlForHref(cert.url)}
                        style={{
                          ...styles.itemTitle,
                          color: theme.link,
                          textDecoration: 'none',
                        }}
                      >
                        {cert.name}
                      </Link>
                    ) : (
                      <Text style={styles.itemTitle}>{cert.name}</Text>
                    )}
                    {cert.authority && (
                      <Text style={styles.itemSubtitle}>
                        {cert.authority}
                      </Text>
                    )}
                  </View>
                  {cert.issuedAt && (
                    <View
                      style={{ alignItems: 'flex-end', flexShrink: 0 }}
                    >
                      <Text style={styles.dates}>
                        {formatDate(cert.issuedAt)}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Awards */}
        {data.awards && data.awards.length > 0 && (
          <View wrap={data.awards.length > 3} style={{ marginTop: 12 }}>
            <Text style={styles.sectionTitle}>Awards</Text>
            {data.awards.map((award, i) => (
              <View
                key={i}
                wrap={false}
                style={{
                  ...styles.sectionItemContainer,
                  marginBottom:
                    i === (data.awards?.length ?? 1) - 1 ? 0 : 6,
                }}
              >
                <View style={styles.itemHeader}>
                  <View style={{ flex: 1, minWidth: 0, flexShrink: 1 }}>
                    <Text style={styles.itemTitle}>{award.name}</Text>
                    {award.issuer && (
                      <Text style={styles.itemSubtitle}>
                        {award.issuer}
                      </Text>
                    )}
                  </View>
                  {award.issuedAt && (
                    <View
                      style={{ alignItems: 'flex-end', flexShrink: 0 }}
                    >
                      <Text style={styles.dates}>
                        {formatDate(award.issuedAt)}
                      </Text>
                    </View>
                  )}
                </View>
                {award.description && (
                  <View>
                    <HtmlToPdf html={award.description} style={styles.description} />
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Patents */}
        {data.patents && data.patents.length > 0 && (
          <View wrap={data.patents.length > 3} style={{ marginTop: 12 }}>
            <Text style={styles.sectionTitle}>Patents</Text>
            {data.patents.map((patent, i) => (
              <View
                key={i}
                wrap={false}
                style={{
                  ...styles.sectionItemContainer,
                  marginBottom:
                    i === (data.patents?.length ?? 1) - 1 ? 0 : 8,
                }}
              >
                <View style={styles.itemHeader}>
                  <View style={{ flex: 1, minWidth: 0, flexShrink: 1 }}>
                    {patent.url ? (
                      <Link
                        src={normalizeUrlForHref(patent.url)}
                        style={{
                          ...styles.itemTitle,
                          color: theme.link,
                          textDecoration: 'none',
                        }}
                      >
                        {patent.name}
                      </Link>
                    ) : (
                      <Text style={styles.itemTitle}>{patent.name}</Text>
                    )}
                    {patent.patentNumber && (
                      <Text style={styles.itemSubtitle}>
                        Patent No: {patent.patentNumber}
                      </Text>
                    )}
                  </View>
                  {patent.issuedAt && (
                    <View
                      style={{ alignItems: 'flex-end', flexShrink: 0 }}
                    >
                      <Text style={styles.dates}>
                        {formatDate(patent.issuedAt)}
                      </Text>
                    </View>
                  )}
                </View>
                {patent.description && (
                  <View>
                    <HtmlToPdf html={patent.description} style={styles.description} />
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Languages */}
        {data.languages && data.languages.length > 0 && (
          <View wrap={false} style={{ marginTop: 12 }}>
            <Text style={styles.sectionTitle}>Languages</Text>
            <View style={styles.sectionItemContainer}>
              {data.languages.map((language, i) => (
                <View
                  key={i}
                  break={false}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    flexDirection: 'row',
                    gap: 2,
                  }}
                >
                  <Text style={styles.sidebarText}>
                    • {language.name}
                  </Text>
                  {language.proficiency && (
                    <Text style={styles.sidebarSubtitle}>
                      ({language.proficiency})
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
}
