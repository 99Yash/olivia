import { readFile } from 'node:fs/promises';
import { PDFParse } from 'pdf-parse';
import type { ValidatedResumeData } from '../src/lib/schemas/resume';

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9@.+]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function expectedTextOrder(data: ValidatedResumeData): string[] {
  return [
    data.full_name,
    data.location,
    data.phone_number ? String(data.phone_number) : null,
    data.email,
    data.website_url,
    data.highlights ? 'Highlights' : null,
    data.experiences?.length ? 'Experience' : null,
    ...(data.experiences ?? []).flatMap((experience) => [
      experience.company,
      ...experience.positions.map((position) => position.title),
    ]),
    data.education?.length ? 'Education' : null,
    ...(data.education ?? []).flatMap((education) => [
      education.school,
      education.degreeName,
    ]),
    data.skills?.length ? 'Skills' : null,
    ...(data.skills ?? []).flatMap((group) => [
      group.title,
      ...group.skills,
    ]),
    data.projects?.length ? 'Projects' : null,
    ...(data.projects ?? []).map((project) => project.name),
  ].filter((value): value is string => Boolean(value?.trim()));
}

export async function verifyPdfTextOrder(
  pdfPath: string,
  data: ValidatedResumeData
) {
  const parser = new PDFParse({ data: await readFile(pdfPath) });
  try {
    const result = await parser.getText();
    const text = normalize(result.text);
    let cursor = 0;
    const missingOrReordered: string[] = [];
    for (const expected of expectedTextOrder(data)) {
      const normalizedExpected = normalize(expected);
      const position = text.indexOf(normalizedExpected, cursor);
      if (position === -1) {
        missingOrReordered.push(expected);
        continue;
      }
      cursor = position + normalizedExpected.length;
    }
    if (missingOrReordered.length > 0) {
      throw new Error(
        `PDF text is missing or reordered: ${missingOrReordered.join(', ')}`
      );
    }
  } finally {
    await parser.destroy();
  }
}
