'use client';

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import { ValidatedResumeData, normalizeSkills } from '~/lib/schemas/resume';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
    lineHeight: 1.4,
  },
  header: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 8,
  },
  name: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    fontSize: 9,
    color: '#6b7280',
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginTop: 10,
    marginBottom: 4,
    textTransform: 'uppercase',
    color: '#374151',
    borderBottomWidth: 0.5,
    borderBottomColor: '#d1d5db',
    paddingBottom: 2,
  },
  summary: {
    marginBottom: 4,
    color: '#374151',
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  bold: {
    fontFamily: 'Helvetica-Bold',
  },
  italic: {
    fontFamily: 'Helvetica-Oblique',
    color: '#6b7280',
    fontSize: 9,
  },
  description: {
    marginTop: 2,
    color: '#374151',
  },
  skillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2,
  },
  skillChip: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    fontSize: 9,
  },
  skillCategory: {
    marginTop: 4,
  },
  skillCategoryTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    marginBottom: 2,
  },
});

function formatDate(d: { month?: number | null; year?: number | null } | null | undefined) {
  if (!d) return '';
  const parts: string[] = [];
  if (d.month) parts.push(String(d.month).padStart(2, '0'));
  if (d.year) parts.push(String(d.year));
  return parts.join('/');
}

function DateRange({
  startsAt,
  endsAt,
}: {
  startsAt?: { month?: number | null; year?: number | null } | null;
  endsAt?: { month?: number | null; year?: number | null } | null;
}) {
  const start = formatDate(startsAt);
  const end = formatDate(endsAt) || 'Present';
  if (!start && end === 'Present') return null;
  return (
    <Text style={styles.italic}>
      {start} – {end}
    </Text>
  );
}

export function ResumeDocument({ data }: { data: ValidatedResumeData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          {data.full_name && <Text style={styles.name}>{data.full_name}</Text>}
          <View style={styles.contactRow}>
            {data.email && <Text>{data.email}</Text>}
            {data.phone_number && <Text>{data.phone_number}</Text>}
            {data.location && <Text>{data.location}</Text>}
            {data.website_url && <Text>{data.website_url}</Text>}
          </View>
        </View>

        {/* Summary */}
        {data.summary && (
          <>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={styles.summary}>{data.summary}</Text>
          </>
        )}

        {/* Highlights */}
        {data.highlights && (
          <>
            <Text style={styles.sectionTitle}>Highlights</Text>
            <Text style={styles.summary}>{data.highlights}</Text>
          </>
        )}

        {/* Experience */}
        {data.experiences && data.experiences.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Experience</Text>
            {data.experiences.map((exp, i) => (
              <View key={i}>
                {exp.positions.map((pos, j) => (
                  <View key={j}>
                    <View style={styles.entryHeader}>
                      <Text style={styles.bold}>
                        {pos.title}
                        {exp.company ? ` at ${exp.company}` : ''}
                      </Text>
                      <DateRange startsAt={pos.startsAt} endsAt={pos.endsAt} />
                    </View>
                    {pos.location && (
                      <Text style={styles.italic}>{pos.location}</Text>
                    )}
                    {pos.description && (
                      <Text style={styles.description}>{pos.description}</Text>
                    )}
                  </View>
                ))}
              </View>
            ))}
          </>
        )}

        {/* Education */}
        {data.education && data.education.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Education</Text>
            {data.education.map((edu, i) => (
              <View key={i}>
                <View style={styles.entryHeader}>
                  <Text style={styles.bold}>
                    {[edu.degreeName, edu.fieldOfStudy]
                      .filter(Boolean)
                      .join(' in ')}
                  </Text>
                  <DateRange startsAt={edu.startsAt} endsAt={edu.endsAt} />
                </View>
                {edu.school && (
                  <Text style={styles.italic}>{edu.school}</Text>
                )}
              </View>
            ))}
          </>
        )}

        {/* Skills */}
        {data.skills && data.skills.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Skills</Text>
            {normalizeSkills(data.skills)?.map((cat, i) => (
              <View key={i} style={styles.skillCategory}>
                {cat.title && (
                  <Text style={styles.skillCategoryTitle}>
                    {cat.title}
                  </Text>
                )}
                <View style={styles.skillRow}>
                  {cat.skills?.map((skill, j) => (
                    <Text key={j} style={styles.skillChip}>
                      {skill}
                    </Text>
                  ))}
                </View>
              </View>
            ))}
          </>
        )}

        {/* Projects */}
        {data.projects && data.projects.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Projects</Text>
            {data.projects.map((proj, i) => (
              <View key={i}>
                <View style={styles.entryHeader}>
                  <Text style={styles.bold}>{proj.name}</Text>
                  <DateRange startsAt={proj.startsAt} endsAt={proj.endsAt} />
                </View>
                {proj.description && (
                  <Text style={styles.description}>{proj.description}</Text>
                )}
              </View>
            ))}
          </>
        )}

        {/* Certifications */}
        {data.certifications && data.certifications.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {data.certifications.map((cert, i) => (
              <View key={i}>
                <View style={styles.entryHeader}>
                  <Text style={styles.bold}>{cert.name}</Text>
                  <DateRange startsAt={cert.issuedAt} />
                </View>
                {cert.authority && (
                  <Text style={styles.italic}>{cert.authority}</Text>
                )}
              </View>
            ))}
          </>
        )}

        {/* Awards */}
        {data.awards && data.awards.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Awards</Text>
            {data.awards.map((award, i) => (
              <View key={i}>
                <View style={styles.entryHeader}>
                  <Text style={styles.bold}>{award.name}</Text>
                  <DateRange startsAt={award.issuedAt} />
                </View>
                {award.issuer && (
                  <Text style={styles.italic}>{award.issuer}</Text>
                )}
                {award.description && (
                  <Text style={styles.description}>{award.description}</Text>
                )}
              </View>
            ))}
          </>
        )}

        {/* Patents */}
        {data.patents && data.patents.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Patents</Text>
            {data.patents.map((patent, i) => (
              <View key={i}>
                <View style={styles.entryHeader}>
                  <Text style={styles.bold}>{patent.name}</Text>
                  <DateRange startsAt={patent.issuedAt} />
                </View>
                {patent.patentNumber && (
                  <Text style={styles.italic}>#{patent.patentNumber}</Text>
                )}
                {patent.description && (
                  <Text style={styles.description}>{patent.description}</Text>
                )}
              </View>
            ))}
          </>
        )}

        {/* Languages */}
        {data.languages && data.languages.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Languages</Text>
            <View style={styles.skillRow}>
              {data.languages.map((lang, i) => (
                <Text key={i} style={styles.skillChip}>
                  {lang.name}
                  {lang.proficiency ? ` (${lang.proficiency})` : ''}
                </Text>
              ))}
            </View>
          </>
        )}
      </Page>
    </Document>
  );
}
