'use client';

import { PlusIcon, TrashIcon } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RichTextEditor } from '~/components/rich-text-editor';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/components/ui/accordion';
import { ValidatedResumeData } from '~/lib/schemas/resume';
import { MonthYearPicker, type MonthYearValue } from './month-year-picker';

function debounce<T extends (...args: any[]) => void>(fn: T, ms: number): T & { cancel: () => void } {
  let timer: ReturnType<typeof setTimeout>;
  const debounced = ((...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as unknown as T & { cancel: () => void };
  debounced.cancel = () => clearTimeout(timer);
  return debounced;
}

function AddButton({ title, onClick }: { title: string; onClick: () => void }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="w-full"
      onClick={onClick}
    >
      <PlusIcon className="size-4" />
      {title}
    </Button>
  );
}

function RemoveButton({
  title,
  onClick,
}: {
  title: string;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="w-full text-destructive hover:text-destructive"
      onClick={onClick}
    >
      <TrashIcon className="size-3" />
      {title}
    </Button>
  );
}

// Sort helpers — null/empty dates sort to the top (newest-first assumption)
function dateToNum(d: { month?: number | null; year?: number | null } | null | undefined): number {
  if (!d?.year) return Infinity; // no date → top
  return d.year * 100 + (d.month ?? 0);
}

function sortByStartDateDesc<T extends { startsAt?: { month?: number | null; year?: number | null } | null }>(
  a: T,
  b: T
): number {
  return dateToNum(b.startsAt) - dateToNum(a.startsAt);
}

function sortByNewestPositionDesc(
  a: { positions?: { startsAt?: { month?: number | null; year?: number | null } | null }[] },
  b: { positions?: { startsAt?: { month?: number | null; year?: number | null } | null }[] }
): number {
  const aDate = a.positions?.[0]?.startsAt;
  const bDate = b.positions?.[0]?.startsAt;
  return dateToNum(bDate) - dateToNum(aDate);
}

function sortByIssuedDateDesc<T extends { issuedAt?: { month?: number | null; year?: number | null } | null }>(
  a: T,
  b: T
): number {
  return dateToNum(b.issuedAt) - dateToNum(a.issuedAt);
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function DateFields({
  startLabel,
  endLabel,
  startsAt,
  endsAt,
  onStartChange,
  onEndChange,
}: {
  startLabel?: string;
  endLabel?: string;
  startsAt: MonthYearValue;
  endsAt?: MonthYearValue;
  onStartChange: (val: MonthYearValue) => void;
  onEndChange?: (val: MonthYearValue) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Field label={startLabel ?? 'Start Date'}>
        <MonthYearPicker value={startsAt} onChange={onStartChange} />
      </Field>
      {onEndChange && endsAt !== undefined && (
        <Field label={endLabel ?? 'End Date'}>
          <MonthYearPicker value={endsAt} onChange={onEndChange} />
        </Field>
      )}
    </div>
  );
}

// --- Section Components ---

function ContactSection({
  resumeData,
  updateField,
}: {
  resumeData: ValidatedResumeData;
  updateField: (field: string, value: any, deb?: boolean) => void;
}) {
  const [local, setLocal] = useState({
    full_name: resumeData.full_name ?? '',
    phone_number: resumeData.phone_number ?? '',
    website_url: resumeData.website_url ?? '',
    email: resumeData.email ?? '',
    location: resumeData.location ?? '',
  });

  useEffect(() => {
    setLocal({
      full_name: resumeData.full_name ?? '',
      phone_number: resumeData.phone_number ?? '',
      website_url: resumeData.website_url ?? '',
      email: resumeData.email ?? '',
      location: resumeData.location ?? '',
    });
  }, [
    resumeData.full_name,
    resumeData.phone_number,
    resumeData.website_url,
    resumeData.email,
    resumeData.location,
  ]);

  const handleChange = (field: keyof typeof local, value: string) => {
    setLocal((prev) => ({ ...prev, [field]: value }));
    updateField(field, value, true);
  };

  return (
    <AccordionItem value="contact">
      <AccordionTrigger className="px-1 font-semibold">
        Contact Information
      </AccordionTrigger>
      <AccordionContent className="space-y-3 px-1">
        <Field label="Full Name">
          <Input
            value={local.full_name}
            onChange={(e) => handleChange('full_name', e.target.value)}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Email">
            <Input
              value={local.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
          </Field>
          <Field label="Phone">
            <Input
              value={local.phone_number}
              onChange={(e) => handleChange('phone_number', e.target.value)}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Location">
            <Input
              value={local.location}
              onChange={(e) => handleChange('location', e.target.value)}
            />
          </Field>
          <Field label="Website URL">
            <Input
              value={local.website_url}
              onChange={(e) => handleChange('website_url', e.target.value)}
            />
          </Field>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

function SummarySection({
  resumeData,
  updateField,
}: {
  resumeData: ValidatedResumeData;
  updateField: (field: string, value: any, deb?: boolean) => void;
}) {
  return (
    <AccordionItem value="summary">
      <AccordionTrigger className="px-1 font-semibold">
        Summary
      </AccordionTrigger>
      <AccordionContent className="px-1">
        <RichTextEditor
          initialContent={resumeData.summary ?? ''}
          placeholder="Professional summary..."
          minHeight="8rem"
          onChange={(html) => updateField('summary', html, true)}
        />
      </AccordionContent>
    </AccordionItem>
  );
}

function HighlightsSection({
  resumeData,
  updateField,
}: {
  resumeData: ValidatedResumeData;
  updateField: (field: string, value: any, deb?: boolean) => void;
}) {
  return (
    <AccordionItem value="highlights">
      <AccordionTrigger className="px-1 font-semibold">
        Highlights
      </AccordionTrigger>
      <AccordionContent className="px-1">
        <RichTextEditor
          initialContent={resumeData.highlights ?? ''}
          placeholder="Key highlights..."
          minHeight="8rem"
          onChange={(html) => updateField('highlights', html, true)}
        />
      </AccordionContent>
    </AccordionItem>
  );
}

function ExperienceSection({
  resumeData,
  updateField,
}: {
  resumeData: ValidatedResumeData;
  updateField: (field: string, value: any, deb?: boolean) => void;
}) {
  const [local, setLocal] = useState(resumeData.experiences ?? []);
  useEffect(
    () => setLocal(resumeData.experiences ?? []),
    [resumeData.experiences]
  );

  const update = (updated: typeof local, deb = false) => {
    setLocal(updated);
    updateField('experiences', updated, deb);
  };

  return (
    <AccordionItem value="experiences">
      <AccordionTrigger className="px-1 font-semibold">
        Experience
      </AccordionTrigger>
      <AccordionContent className="space-y-4 px-1">
        {local.map((exp, i) => (
          <div
            key={i}
            className="space-y-3 rounded-md border p-3"
          >
            <Field label="Company">
              <Input
                value={exp.company ?? ''}
                onChange={(e) => {
                  const u = [...local];
                  u[i] = { ...exp, company: e.target.value };
                  update(u, true);
                }}
              />
            </Field>
            {(exp.positions ?? []).map((pos, j) => (
              <div
                key={j}
                className="space-y-2 rounded border p-2"
              >
                <Field label="Title">
                  <Input
                    value={pos.title ?? ''}
                    onChange={(e) => {
                      const u = [...local];
                      const positions = [...(exp.positions ?? [])];
                      positions[j] = { ...pos, title: e.target.value };
                      u[i] = { ...exp, positions };
                      update(u, true);
                    }}
                  />
                </Field>
                <Field label="Location">
                  <Input
                    value={pos.location ?? ''}
                    onChange={(e) => {
                      const u = [...local];
                      const positions = [...(exp.positions ?? [])];
                      positions[j] = { ...pos, location: e.target.value };
                      u[i] = { ...exp, positions };
                      update(u, true);
                    }}
                  />
                </Field>
                <DateFields
                  startsAt={pos.startsAt ?? { month: null, year: null }}
                  endsAt={pos.endsAt ?? { month: null, year: null }}
                  onStartChange={(val) => {
                    const u = [...local];
                    const positions = [...(exp.positions ?? [])];
                    positions[j] = { ...pos, startsAt: val };
                    u[i] = { ...exp, positions };
                    update(u);
                  }}
                  onEndChange={(val) => {
                    const u = [...local];
                    const positions = [...(exp.positions ?? [])];
                    positions[j] = { ...pos, endsAt: val };
                    u[i] = { ...exp, positions };
                    update(u);
                  }}
                />
                <Field label="Description">
                  <RichTextEditor
                    initialContent={pos.description ?? ''}
                    placeholder="Describe your role and achievements..."
                    minHeight="6rem"
                    onChange={(html) => {
                      const u = [...local];
                      const positions = [...(exp.positions ?? [])];
                      positions[j] = { ...pos, description: html };
                      u[i] = { ...exp, positions };
                      update(u, true);
                    }}
                  />
                </Field>
                <RemoveButton
                  title="Remove Position"
                  onClick={() => {
                    const u = [...local];
                    const positions = [...(exp.positions ?? [])];
                    positions.splice(j, 1);
                    u[i] = { ...exp, positions };
                    update(u);
                  }}
                />
              </div>
            ))}
            <AddButton
              title="Add Position"
              onClick={() => {
                const u = [...local];
                u[i] = {
                  ...exp,
                  positions: [
                    {
                      title: '',
                      description: '',
                      location: '',
                      startsAt: { month: null, year: null },
                      endsAt: { month: null, year: null },
                    },
                    ...(exp.positions ?? []),
                  ].sort(sortByStartDateDesc),
                };
                update(u);
              }}
            />
            <RemoveButton
              title="Remove Company"
              onClick={() => {
                const u = [...local];
                u.splice(i, 1);
                update(u);
              }}
            />
          </div>
        ))}
        <AddButton
          title="Add Experience"
          onClick={() =>
            update([{ company: '', positions: [] }, ...local].sort(sortByNewestPositionDesc))
          }
        />
      </AccordionContent>
    </AccordionItem>
  );
}

function EducationSection({
  resumeData,
  updateField,
}: {
  resumeData: ValidatedResumeData;
  updateField: (field: string, value: any, deb?: boolean) => void;
}) {
  const [local, setLocal] = useState(resumeData.education ?? []);
  useEffect(
    () => setLocal(resumeData.education ?? []),
    [resumeData.education]
  );

  const update = (updated: typeof local, deb = false) => {
    setLocal(updated);
    updateField('education', updated, deb);
  };

  return (
    <AccordionItem value="education">
      <AccordionTrigger className="px-1 font-semibold">
        Education
      </AccordionTrigger>
      <AccordionContent className="space-y-4 px-1">
        {local.map((edu, i) => (
          <div key={i} className="space-y-3 rounded-md border p-3">
            <Field label="School">
              <Input
                value={edu.school ?? ''}
                onChange={(e) => {
                  const u = [...local];
                  u[i] = { ...edu, school: e.target.value };
                  update(u, true);
                }}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Degree">
                <Input
                  value={edu.degreeName ?? ''}
                  onChange={(e) => {
                    const u = [...local];
                    u[i] = { ...edu, degreeName: e.target.value };
                    update(u, true);
                  }}
                />
              </Field>
              <Field label="Field of Study">
                <Input
                  value={edu.fieldOfStudy ?? ''}
                  onChange={(e) => {
                    const u = [...local];
                    u[i] = { ...edu, fieldOfStudy: e.target.value };
                    update(u, true);
                  }}
                />
              </Field>
            </div>
            <DateFields
              startsAt={edu.startsAt ?? { month: null, year: null }}
              endsAt={edu.endsAt ?? { month: null, year: null }}
              onStartChange={(val) => {
                const u = [...local];
                u[i] = { ...edu, startsAt: val };
                update(u);
              }}
              onEndChange={(val) => {
                const u = [...local];
                u[i] = { ...edu, endsAt: val };
                update(u);
              }}
            />
            <RemoveButton
              title="Remove Education"
              onClick={() => {
                const u = [...local];
                u.splice(i, 1);
                update(u);
              }}
            />
          </div>
        ))}
        <AddButton
          title="Add Education"
          onClick={() =>
            update([
              {
                school: '',
                degreeName: '',
                fieldOfStudy: '',
                startsAt: { month: null, year: null },
                endsAt: { month: null, year: null },
              },
              ...local,
            ].sort(sortByStartDateDesc))
          }
        />
      </AccordionContent>
    </AccordionItem>
  );
}

function ProjectsSection({
  resumeData,
  updateField,
}: {
  resumeData: ValidatedResumeData;
  updateField: (field: string, value: any, deb?: boolean) => void;
}) {
  const [local, setLocal] = useState(resumeData.projects ?? []);
  useEffect(
    () => setLocal(resumeData.projects ?? []),
    [resumeData.projects]
  );

  const update = (updated: typeof local, deb = false) => {
    setLocal(updated);
    updateField('projects', updated, deb);
  };

  return (
    <AccordionItem value="projects">
      <AccordionTrigger className="px-1 font-semibold">
        Projects
      </AccordionTrigger>
      <AccordionContent className="space-y-4 px-1">
        {local.map((proj, i) => (
          <div key={i} className="space-y-3 rounded-md border p-3">
            <Field label="Project Name">
              <Input
                value={proj.name ?? ''}
                onChange={(e) => {
                  const u = [...local];
                  u[i] = { ...proj, name: e.target.value };
                  update(u, true);
                }}
              />
            </Field>
            <Field label="Description">
              <RichTextEditor
                initialContent={proj.description ?? ''}
                placeholder="Describe the project..."
                minHeight="5rem"
                onChange={(html) => {
                  const u = [...local];
                  u[i] = { ...proj, description: html };
                  update(u, true);
                }}
              />
            </Field>
            <DateFields
              startsAt={proj.startsAt ?? { month: null, year: null }}
              endsAt={proj.endsAt ?? { month: null, year: null }}
              onStartChange={(val) => {
                const u = [...local];
                u[i] = { ...proj, startsAt: val };
                update(u);
              }}
              onEndChange={(val) => {
                const u = [...local];
                u[i] = { ...proj, endsAt: val };
                update(u);
              }}
            />
            <RemoveButton
              title="Remove Project"
              onClick={() => {
                const u = [...local];
                u.splice(i, 1);
                update(u);
              }}
            />
          </div>
        ))}
        <AddButton
          title="Add Project"
          onClick={() =>
            update([
              {
                name: '',
                description: '',
                startsAt: { month: null, year: null },
                endsAt: { month: null, year: null },
              },
              ...local,
            ].sort(sortByStartDateDesc))
          }
        />
      </AccordionContent>
    </AccordionItem>
  );
}

function SkillsSection({
  resumeData,
  updateField,
}: {
  resumeData: ValidatedResumeData;
  updateField: (field: string, value: any, deb?: boolean) => void;
}) {
  const [local, setLocal] = useState(resumeData.skills ?? []);
  useEffect(() => setLocal(resumeData.skills ?? []), [resumeData.skills]);

  const update = (updated: typeof local, deb = false) => {
    setLocal(updated);
    updateField('skills', updated, deb);
  };

  return (
    <AccordionItem value="skills">
      <AccordionTrigger className="px-1 font-semibold">
        Skills
      </AccordionTrigger>
      <AccordionContent className="space-y-4 px-1">
        {local.map((cat, i) => (
          <div key={i} className="space-y-2 rounded-md border p-3">
            <Field label="Category Title">
              <Input
                value={cat.title ?? ''}
                placeholder="e.g., Programming Languages"
                onChange={(e) => {
                  const u = [...local];
                  u[i] = { ...cat, title: e.target.value || null };
                  update(u, true);
                }}
              />
            </Field>
            <Field label="Skills (comma-separated)">
              <Textarea
                className="min-h-[60px]"
                value={cat.skills?.join(', ') ?? ''}
                placeholder="React, TypeScript, Node.js"
                onChange={(e) => {
                  const u = [...local];
                  u[i] = {
                    ...cat,
                    skills: e.target.value.split(',').map((s) => s.trim()),
                  };
                  update(u, true);
                }}
              />
            </Field>
            <RemoveButton
              title="Remove Category"
              onClick={() => {
                const u = [...local];
                u.splice(i, 1);
                update(u);
              }}
            />
          </div>
        ))}
        <AddButton
          title="Add Skill Category"
          onClick={() =>
            update([...local, { title: null, skills: [] }])
          }
        />
      </AccordionContent>
    </AccordionItem>
  );
}

function CertificationsSection({
  resumeData,
  updateField,
}: {
  resumeData: ValidatedResumeData;
  updateField: (field: string, value: any, deb?: boolean) => void;
}) {
  const [local, setLocal] = useState(resumeData.certifications ?? []);
  useEffect(
    () => setLocal(resumeData.certifications ?? []),
    [resumeData.certifications]
  );

  const update = (updated: typeof local, deb = false) => {
    setLocal(updated);
    updateField('certifications', updated, deb);
  };

  return (
    <AccordionItem value="certifications">
      <AccordionTrigger className="px-1 font-semibold">
        Certifications
      </AccordionTrigger>
      <AccordionContent className="space-y-4 px-1">
        {local.map((cert, i) => (
          <div key={i} className="space-y-3 rounded-md border p-3">
            <Field label="Certification Name">
              <Input
                value={cert.name ?? ''}
                onChange={(e) => {
                  const u = [...local];
                  u[i] = { ...cert, name: e.target.value };
                  update(u, true);
                }}
              />
            </Field>
            <Field label="Authority">
              <Input
                value={cert.authority ?? ''}
                onChange={(e) => {
                  const u = [...local];
                  u[i] = { ...cert, authority: e.target.value };
                  update(u, true);
                }}
              />
            </Field>
            <Field label="URL">
              <Input
                value={cert.url ?? ''}
                onChange={(e) => {
                  const u = [...local];
                  u[i] = { ...cert, url: e.target.value };
                  update(u, true);
                }}
              />
            </Field>
            <DateFields
              startLabel="Issued Date"
              startsAt={cert.issuedAt ?? { month: null, year: null }}
              onStartChange={(val) => {
                const u = [...local];
                u[i] = { ...cert, issuedAt: val };
                update(u);
              }}
            />
            <RemoveButton
              title="Remove Certification"
              onClick={() => {
                const u = [...local];
                u.splice(i, 1);
                update(u);
              }}
            />
          </div>
        ))}
        <AddButton
          title="Add Certification"
          onClick={() =>
            update([
              {
                name: '',
                authority: '',
                url: '',
                issuedAt: { month: null, year: null },
              },
              ...local,
            ].sort(sortByIssuedDateDesc))
          }
        />
      </AccordionContent>
    </AccordionItem>
  );
}

function AwardsSection({
  resumeData,
  updateField,
}: {
  resumeData: ValidatedResumeData;
  updateField: (field: string, value: any, deb?: boolean) => void;
}) {
  const [local, setLocal] = useState(resumeData.awards ?? []);
  useEffect(
    () => setLocal(resumeData.awards ?? []),
    [resumeData.awards]
  );

  const update = (updated: typeof local, deb = false) => {
    setLocal(updated);
    updateField('awards', updated, deb);
  };

  return (
    <AccordionItem value="awards">
      <AccordionTrigger className="px-1 font-semibold">
        Awards
      </AccordionTrigger>
      <AccordionContent className="space-y-4 px-1">
        {local.map((award, i) => (
          <div key={i} className="space-y-3 rounded-md border p-3">
            <Field label="Award Name">
              <Input
                value={award.name ?? ''}
                onChange={(e) => {
                  const u = [...local];
                  u[i] = { ...award, name: e.target.value };
                  update(u, true);
                }}
              />
            </Field>
            <Field label="Description">
              <RichTextEditor
                initialContent={award.description ?? ''}
                placeholder="Describe the award..."
                minHeight="5rem"
                onChange={(html) => {
                  const u = [...local];
                  u[i] = { ...award, description: html };
                  update(u, true);
                }}
              />
            </Field>
            <Field label="Issuer">
              <Input
                value={award.issuer ?? ''}
                onChange={(e) => {
                  const u = [...local];
                  u[i] = { ...award, issuer: e.target.value };
                  update(u, true);
                }}
              />
            </Field>
            <DateFields
              startLabel="Issued Date"
              startsAt={award.issuedAt ?? { month: null, year: null }}
              onStartChange={(val) => {
                const u = [...local];
                u[i] = { ...award, issuedAt: val };
                update(u);
              }}
            />
            <RemoveButton
              title="Remove Award"
              onClick={() => {
                const u = [...local];
                u.splice(i, 1);
                update(u);
              }}
            />
          </div>
        ))}
        <AddButton
          title="Add Award"
          onClick={() =>
            update([
              {
                name: '',
                description: '',
                issuer: '',
                issuedAt: { month: null, year: null },
              },
              ...local,
            ].sort(sortByIssuedDateDesc))
          }
        />
      </AccordionContent>
    </AccordionItem>
  );
}

function PatentsSection({
  resumeData,
  updateField,
}: {
  resumeData: ValidatedResumeData;
  updateField: (field: string, value: any, deb?: boolean) => void;
}) {
  const [local, setLocal] = useState(resumeData.patents ?? []);
  useEffect(
    () => setLocal(resumeData.patents ?? []),
    [resumeData.patents]
  );

  const update = (updated: typeof local, deb = false) => {
    setLocal(updated);
    updateField('patents', updated, deb);
  };

  return (
    <AccordionItem value="patents">
      <AccordionTrigger className="px-1 font-semibold">
        Patents
      </AccordionTrigger>
      <AccordionContent className="space-y-4 px-1">
        {local.map((pat, i) => (
          <div key={i} className="space-y-3 rounded-md border p-3">
            <Field label="Patent Name">
              <Input
                value={pat.name ?? ''}
                onChange={(e) => {
                  const u = [...local];
                  u[i] = { ...pat, name: e.target.value };
                  update(u, true);
                }}
              />
            </Field>
            <Field label="Description">
              <RichTextEditor
                initialContent={pat.description ?? ''}
                placeholder="Describe the patent..."
                minHeight="5rem"
                onChange={(html) => {
                  const u = [...local];
                  u[i] = { ...pat, description: html };
                  update(u, true);
                }}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Patent Number">
                <Input
                  value={pat.patentNumber ?? ''}
                  onChange={(e) => {
                    const u = [...local];
                    u[i] = { ...pat, patentNumber: e.target.value };
                    update(u, true);
                  }}
                />
              </Field>
              <Field label="URL">
                <Input
                  value={pat.url ?? ''}
                  onChange={(e) => {
                    const u = [...local];
                    u[i] = { ...pat, url: e.target.value };
                    update(u, true);
                  }}
                />
              </Field>
            </div>
            <DateFields
              startLabel="Issued Date"
              startsAt={pat.issuedAt ?? { month: null, year: null }}
              onStartChange={(val) => {
                const u = [...local];
                u[i] = { ...pat, issuedAt: val };
                update(u);
              }}
            />
            <RemoveButton
              title="Remove Patent"
              onClick={() => {
                const u = [...local];
                u.splice(i, 1);
                update(u);
              }}
            />
          </div>
        ))}
        <AddButton
          title="Add Patent"
          onClick={() =>
            update([
              {
                name: '',
                description: '',
                patentNumber: '',
                url: '',
                issuedAt: { month: null, year: null },
              },
              ...local,
            ].sort(sortByIssuedDateDesc))
          }
        />
      </AccordionContent>
    </AccordionItem>
  );
}

function LanguagesSection({
  resumeData,
  updateField,
}: {
  resumeData: ValidatedResumeData;
  updateField: (field: string, value: any, deb?: boolean) => void;
}) {
  const [local, setLocal] = useState(resumeData.languages ?? []);
  useEffect(
    () => setLocal(resumeData.languages ?? []),
    [resumeData.languages]
  );

  const update = (updated: typeof local, deb = false) => {
    setLocal(updated);
    updateField('languages', updated, deb);
  };

  return (
    <AccordionItem value="languages">
      <AccordionTrigger className="px-1 font-semibold">
        Languages
      </AccordionTrigger>
      <AccordionContent className="space-y-4 px-1">
        {local.map((lang, i) => (
          <div key={i} className="space-y-2 rounded-md border p-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Language">
                <Input
                  value={lang.name ?? ''}
                  onChange={(e) => {
                    const u = [...local];
                    u[i] = { ...lang, name: e.target.value };
                    update(u, true);
                  }}
                />
              </Field>
              <Field label="Proficiency">
                <Input
                  value={lang.proficiency ?? ''}
                  onChange={(e) => {
                    const u = [...local];
                    u[i] = { ...lang, proficiency: e.target.value };
                    update(u, true);
                  }}
                />
              </Field>
            </div>
            <RemoveButton
              title="Remove Language"
              onClick={() => {
                const u = [...local];
                u.splice(i, 1);
                update(u);
              }}
            />
          </div>
        ))}
        <AddButton
          title="Add Language"
          onClick={() =>
            update([{ name: '', proficiency: '' }, ...local])
          }
        />
      </AccordionContent>
    </AccordionItem>
  );
}

// --- Main Form ---

interface ResumeEditFormProps {
  resumeData: ValidatedResumeData;
  onChange: (updated: ValidatedResumeData) => void;
}

export function ResumeEditForm({ resumeData, onChange }: ResumeEditFormProps) {
  const resumeDataRef = useRef(resumeData);
  resumeDataRef.current = resumeData;

  const debouncedUpdate = useMemo(
    () =>
      debounce((field: string, value: any) => {
        onChange({ ...resumeDataRef.current, [field]: value });
      }, 300),
    [onChange]
  );

  useEffect(() => {
    return () => debouncedUpdate.cancel();
  }, [debouncedUpdate]);

  const updateField = useCallback(
    (field: string, value: any, deb = false) => {
      if (deb) {
        debouncedUpdate(field, value);
      } else {
        onChange({ ...resumeDataRef.current, [field]: value });
      }
    },
    [debouncedUpdate, onChange]
  );

  const sectionProps = { resumeData, updateField };

  return (
    <div className="h-full overflow-y-auto p-4">
      <Accordion type="multiple" defaultValue={['contact']}>
        <ContactSection {...sectionProps} />
        <SummarySection {...sectionProps} />
        <HighlightsSection {...sectionProps} />
        <ExperienceSection {...sectionProps} />
        <EducationSection {...sectionProps} />
        <ProjectsSection {...sectionProps} />
        <SkillsSection {...sectionProps} />
        <CertificationsSection {...sectionProps} />
        <AwardsSection {...sectionProps} />
        <PatentsSection {...sectionProps} />
        <LanguagesSection {...sectionProps} />
      </Accordion>
    </div>
  );
}
