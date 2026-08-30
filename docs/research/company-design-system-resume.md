# Company-aware resume design for Olivia

Research date: 2026-08-30

## Decision

Olivia can add a credible “match the company’s design language” feature without turning a resume into a brand imitation.

The safe product is a **company-informed resume theme**, not a copy of the company site. It should:

- identify the hiring organization and its official web property;
- show the public sources that informed the design;
- extract a small set of design signals;
- convert those signals into a restrained, ATS-safe resume theme;
- let the user compare the standard and company-informed versions; and
- never add a company logo or a restricted font by default.

The best MVP is unusually direct. Olivia already uses `@mendable/firecrawl-js@4.15.1`, and that installed SDK includes the `branding` scrape format and a typed `BrandingProfile`. Firecrawl’s official documentation says this format can return colors, fonts, typography, spacing, component styles, images, layout, and personality, and that it can be combined with Markdown and screenshots ([Firecrawl scrape documentation](https://docs.firecrawl.dev/features/scrape#extract-brand-identity)). Olivia does not need to build a browser-level CSS analyzer for the first version.

## What “company design system” can mean

There are three source levels. Olivia must keep them separate.

1. **Public design system or brand guide — high confidence.** Examples show that official systems publish semantic tokens and rules, not only color swatches. Atlassian describes tokens as the source of truth for color, elevation, spacing, typography, and themes ([Atlassian design tokens](https://atlassian.design/foundations/tokens/design-tokens/)). GitHub Primer separates base, functional, and component color tokens and tells product designers not to use raw base colors directly ([Primer color usage](https://primer.style/product/getting-started/foundations/color-usage/)). Carbon also maps colors to roles through theme tokens and recommends neutral text with restrained blue for links and primary actions ([Carbon color](https://v10.carbondesignsystem.com/guidelines/color/overview/)).
2. **Official company site — medium confidence.** A company site can show its current visual language, but a marketing page is not always the product design system. Use several official pages when possible: home, product, and careers.
3. **Job page only — low confidence.** A job page can be hosted and styled by an ATS. Its visual design may belong to the ATS provider. Use it only as a fallback and label it clearly.

This distinction is important. A detected hex value is an observation. It is not proof that the value is the company’s primary brand token.

## Resolve the organization before extracting design

Olivia accepts a job URL today. It should resolve the employer before it profiles the visual design.

### From a job URL

Use deterministic page data first:

1. Request `rawHtml` with the existing job scrape.
2. Parse JSON-LD for a `JobPosting` object.
3. Read `hiringOrganization.name`, then `hiringOrganization.sameAs` or `url` when present.
4. Treat `sameAs` as identity evidence, not as permission to use brand assets. Schema.org defines `hiringOrganization` as the organization or person that offers the position, and defines `sameAs` as a page that unambiguously identifies the item, including an official site ([Schema.org `hiringOrganization`](https://schema.org/hiringOrganization), [Schema.org `sameAs`](https://schema.org/sameAs)). Google’s official job-posting guidance also uses `hiringOrganization` with `name`, `sameAs`, and `logo` ([Google JobPosting guidance](https://developers.google.com/search/docs/appearance/structured-data/job-posting)).
5. If structured data has no official URL, extract the company name from the validated job content and search for the official site. Firecrawl Search supports domain filters and can scrape results in the same request ([Firecrawl Search domain filters](https://docs.firecrawl.dev/features/search#domain-filters), [Firecrawl Search with content](https://docs.firecrawl.dev/features/search#search-with-content-scraping)).
6. Do not accept an aggregator, social profile, directory, or ATS hostname as the official company site without more evidence.

Suggested identity confidence:

- **High:** the job is on the company domain, or `hiringOrganization.sameAs` points to the company domain and the company page identifies the same organization.
- **Medium:** a search result appears to be the official site and the company name, page title, and organization metadata agree.
- **Low:** the only evidence is visible job text or an ATS page.

### From a company URL

Use the supplied URL as the candidate official property. Confirm that the page identifies the supplied company name. Follow its canonical URL and same-origin links only for the first pass.

### From a company name

Search for the official company home page. Require at least two matching identity signals, such as page title, organization metadata, legal footer name, or a careers page on the same registrable domain. If the name is ambiguous, return a low-confidence profile and require user confirmation instead of silently applying a theme.

## Discover a public design system

For the first version, use this ordered search:

1. Look for links from the official company property with labels or paths such as `design`, `design-system`, `brand`, `brand-guidelines`, `tokens`, `components`, or `UI kit`.
2. Search the official domain for “design system”, “brand guidelines”, and “design tokens”. Firecrawl Search can restrict results with `includeDomains`; this is useful and keeps the first pass within a known property ([Firecrawl Search domain filters](https://docs.firecrawl.dev/features/search#domain-filters)).
3. Run one broader search for `"<company>" design system` and `"<company>" brand guidelines`. Accept an external domain or GitHub repository only when the official company property links to it, the repository belongs to a verified official organization, or the design-system property clearly identifies its owner.
4. Cap discovery at a small number of pages. One official design-system page plus the company home and careers pages is enough for an MVP.

Official systems support this source-first approach. Primer identifies itself as GitHub’s design system and publishes color, spacing, and typography primitives ([Primer](https://primer.style/)). Atlassian publishes its foundations and tokens in one official system ([Atlassian foundations](https://atlassian.design/foundations)). Carbon identifies its colors and typography as part of IBM’s design language ([Carbon color](https://v10.carbondesignsystem.com/guidelines/color/overview/), [Carbon typography](https://carbondesignsystem.com/elements/typography/overview/)). These pages are stronger evidence than a screenshot or a palette generated from one landing page.

## Signals to extract and how to use them

### Color

Extract:

- primary and accent candidates;
- page background;
- primary and secondary text;
- link color;
- frequency and semantic use across sources; and
- light or dark mode.

Do not copy a full palette into the resume. Convert it to a narrow semantic theme:

- white or near-white paper background;
- black or near-black body text;
- one validated company accent for the header rule, links, or section markers; and
- neutral muted text that keeps enough contrast.

This follows the public systems themselves. Carbon uses neutral gray as the dominant family and says that blue and other colors should be used sparingly and with purpose ([Carbon color](https://v10.carbondesignsystem.com/guidelines/color/overview/)). Primer states that functional tokens should carry roles and that base colors should not be used directly ([Primer color usage](https://primer.style/product/getting-started/foundations/color-usage/)).

For all normal-size text, require a contrast ratio of at least 4.5:1. W3C’s WCAG guidance sets 4.5:1 for normal text and 3:1 for large text ([W3C contrast guidance](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum)). If a brand color fails as text, keep it as a decorative rule or choose the nearest darker accessible value. Record that transformation in the profile.

### Typography

Extract:

- observed heading and body families;
- font category or character: modern sans, humanist sans, editorial serif, technical mono, or traditional;
- weights, sizes, line heights, and tracking patterns; and
- the public source that declares the family.

Use typography as a **character signal**, not an automatic download instruction. A font visible on a public page may have a restricted license. The MVP should map the observed character to a safe resume font. React-PDF includes Helvetica, Times, and Courier and supports registered TTF and WOFF files ([React-PDF font documentation](https://react-pdf.org/docs/v4/fonts)). Use an exact external font only when Olivia stores a clear license source that permits the required embedding and distribution.

Apply size-specific tracking and leading. Large names can use slightly tighter tracking. Body text should stay close to normal tracking with generous line height. Primer’s official typography guidance uses `rem`, unitless line heights, and a hierarchy designed for efficient reading; it also advises against using color as the main form of emphasis ([Primer typography](https://primer.style/product/getting-started/foundations/typography/)).

### Spacing, borders, and shape

Extract a likely base spacing unit, vertical rhythm, rule weight, and corner character. Use them only inside fixed resume bounds. A web card radius or 12-column product grid does not transfer directly to a printed resume.

Good print adaptations are:

- section cadence based on a 4- or 8-point rhythm;
- one thin header rule;
- consistent space before and after section titles; and
- no decorative cards around every section.

### Logos, icons, imagery, and motion

Do not place the target company logo on an applicant’s resume by default. A logo can imply affiliation or endorsement. Official Google guidance says not to use its logo or brand elements in a way that implies affiliation, endorsement, or sponsorship, and also says not to imitate its visual identity ([Google Brand Resource Center](https://about.google/brand-resource-center/guidance/)). GitHub gives the same warning for its name and logos ([GitHub logo guidance](https://brand.github.com/foundations/logo)). Apple restricts third-party logo use and says authorized use must follow the relevant agreement ([Apple trademark guidance](https://www.apple.com/legal/intellectual-property/guidelinesfor3rdparties.html)). Company rules differ, so Olivia should not infer permission from technical access to an image URL.

The default output should therefore contain no company logo, product icon, photo, background image, or decorative illustration. Store detected asset URLs only as evidence, with short retention, and do not render them.

Motion is not part of the PDF. Apple-style motion principles can improve Olivia’s preview interface, but they should not affect the document. Preview changes should respond at once, remain interruptible, and support reduced motion.

## ATS and readability guardrails

The branded version must remain a resume first.

Greenhouse’s official support guidance lists the following causes of unsuccessful or partial resume parsing: graphics, photos, word art, image-only resumes, complex tables, headers and footers, contact information inside headers, footers, or text boxes, column layouts, and unclear or inconsistent sections ([Greenhouse unsuccessful resume parse](https://support.greenhouse.io/hc/en-us/articles/200989175-Unsuccessful-resume-parse)). Greenhouse accepts PDF, DOC, DOCX, RTF, and TXT candidate files ([Greenhouse supported upload formats](https://support.greenhouse.io/hc/en-us/articles/360052218132-Supported-formats-for-resumes-cover-letters-and-other-candidate-uploads)).

Olivia should enforce these rules for every theme:

- keep one logical reading column;
- render all content as real, selectable text;
- keep name and contact data in the main document flow;
- use clear standard headings such as “Experience”, “Education”, “Skills”, and “Projects”;
- avoid tables, sidebars, text boxes, and multi-column skill blocks;
- avoid photos, logos, charts, ratings, and icon-only contact fields;
- keep skills as plain text, not visual chips;
- do not use letter-spaced words that can become separate characters;
- keep dates and organization names as normal text;
- never remove factual history only to force one page; and
- preserve all candidate facts. Styling must never add claims.

After render, extract the PDF text and verify that core fields and section headings exist in the expected order. Olivia already has `pdf-parse`, so this can be a local regression check. The check should fail the company theme and fall back to the standard theme if text is missing, reordered badly, or replaced by an image.

## Provenance and confidence model

Do not store one opaque “company theme” object. Store evidence per important decision.

Suggested shape:

```ts
type Evidence = {
  url: string;
  sourceKind: 'official-design-system' | 'official-brand-guide' |
    'official-company-page' | 'job-page';
  observedAt: string;
  note: string;
};

type AppliedSignal<T> = {
  observed: T | null;
  applied: T;
  confidence: 'high' | 'medium' | 'low';
  evidence: Evidence[];
  transformation?: string;
};

type CompanyDesignProfile = {
  companyName: string;
  officialUrl: string | null;
  identityConfidence: 'high' | 'medium' | 'low';
  accent: AppliedSignal<string>;
  typography: AppliedSignal<{
    observedFamily: string | null;
    safeFamily: 'Helvetica' | 'Times-Roman' | 'Roboto';
    character: 'modern' | 'humanist' | 'editorial' |
      'technical' | 'traditional';
  }>;
  spacingUnit: AppliedSignal<number>;
  overallConfidence: 'high' | 'medium' | 'low';
  warnings: string[];
};
```

The UI should say “Observed” and “Applied”. Example: “Observed Google Sans; applied Helvetica because no reusable font license was confirmed.” This is more credible than claiming the resume “uses Google’s design system”.

Application rules:

- **High confidence:** apply the validated accent, typographic character, and spacing rhythm.
- **Medium confidence:** apply the accent and spacing only; use a safe neutral font.
- **Low confidence:** show a suggested preview, but keep the standard theme selected.

## Practical MVP architecture for this repository

### Current seams

The repository is already close to this architecture:

- `src/lib/services/scrape.service.ts` scrapes a job URL but requests only Markdown with `onlyMainContent: true`. This is good for content, but it removes much of the visual evidence.
- `src/lib/services/workflow.service.ts` has a linear job workflow and a clear place for design discovery after job validation.
- `src/lib/services/ai.service.ts` keeps candidate content in `ValidatedResumeData` and already tells the model not to fabricate facts.
- `src/components/resume-pdf/resume-document.tsx` keeps presentation separate from structured resume content, but it has one fixed Roboto theme and a fixed `#059669` accent.
- `src/db/schemas/job.ts` is the natural owner for a per-job company design profile.

### MVP flow

1. **Scrape and identify.** Extend the job scrape to return Markdown and raw HTML. Parse `JobPosting` JSON-LD before any AI identity guess.
2. **Resolve the official company URL.** Use structured identity data first. Use a tightly limited search only when needed.
3. **Profile design.** Run a second scrape against the official company URL with `formats: ['branding']` and `onlyMainContent: false`. Firecrawl documents that `branding` returns the exact classes of data needed here ([Firecrawl branding profile](https://docs.firecrawl.dev/features/scrape#branding-profile-structure)). The installed SDK version already types this response.
4. **Find a public design system.** Search the official domain first. If a trusted public design-system page exists, scrape it too and raise confidence for the signals it declares.
5. **Normalize.** Validate external values with Zod. Accept only strict color formats, finite spacing values within fixed limits, known URL schemes, and a small typography-character enum. Treat all scraped content as untrusted data.
6. **Map deterministically.** Convert the profile to a small `ResumeTheme`. Do not let an LLM emit arbitrary React-PDF styles. Clamp paper color, text color, font size, margin, line height, and accent use to ATS-safe ranges.
7. **Render one structure with themes.** Change `ResumeDocument` to accept a theme or template ID. Start with `ats-standard` and `company-accented`. Keep both single-column and keep the same content tree.
8. **Preview with agency.** In `PdfPreviewDialog`, add a standard/company toggle, a source link, a confidence label, “Observed / Applied” details, and Reset. Keep the standard version available at all times.
9. **Verify.** Render the PDF, extract its text, check key fields and reading order, check text contrast, and fall back to the standard theme on failure.

Do not send the design profile into the resume-content rewriting prompt. Content tailoring and visual theming have different trust boundaries. The content model may use only the candidate resume and job requirements; the deterministic theme mapper may use only the validated design profile.

### Minimal service split

```text
scrapeJobPage
  -> resolveHiringOrganization
  -> discoverCompanyDesign
  -> normalizeCompanyDesignProfile
  -> tailorResumeContent
  -> mapResumeTheme
  -> render + ATS text check
```

Cache the company profile by canonical company domain, with a refresh time, then store the applied snapshot on each job. This gives repeatable old resumes while avoiding a new discovery scrape for every role at the same company.

## What to borrow from `../alfred`

Alfred has a useful PDF resume template in `../alfred/packages/artifacts-design/src/templates.ts`, with its document vocabulary in `shell.ts` and type tokens in `tokens.ts`. The best ideas to port are:

- structured candidate facts are separate from presentation;
- a resume has one restrained accent moment;
- name, role, contact, summary, experience, and education use a consistent cadence;
- typography has a readable floor and size-specific tracking;
- missing facts are omitted or requested, never invented; and
- page fit must not delete factual history.

Do not copy the Alfred HTML template directly. Olivia renders React-PDF, and Alfred’s two-column footer and visual skill chips conflict with the stricter ATS policy above. Port the tokens and structural intent into an ATS-safe React-PDF template.

## Apple-design interpretation

Use Apple’s principles as a quality bar, not as another visual brand to imitate:

- **Purpose:** the resume communicates the candidate’s fit; brand matching is secondary.
- **Agency:** the user can compare, select, reset, and inspect the evidence.
- **Familiarity:** standard resume labels and one-column reading order stay intact.
- **Simplicity:** use one accent moment instead of a page full of branded components.
- **Craft:** use deliberate type sizes, tracking, leading, contrast, and spacing.
- **Responsibility:** do not imply company affiliation, do not use restricted assets, and do not invent facts.
- **Delight:** the company language should be recognizable through restraint, not through a pasted logo.

## Recommended delivery slices

1. **MVP:** official company URL resolution, Firecrawl `branding`, per-field provenance, deterministic accent/typography-character mapping, standard/company preview toggle, and ATS text verification.
2. **Public design-system discovery:** trusted-domain search, official repository checks, source ranking, and profile caching by company domain.
3. **Template family:** two or three ATS-safe structural templates selected by design character, with the same logical reading order.
4. **Evaluation:** fixture companies with public systems (for example, GitHub Primer, Atlassian Design, and IBM Carbon), PDF text-order tests, contrast tests, and visual snapshots.

The feature should be presented as: **“Company-informed design, based on public sources.”** That is accurate, defensible, and still distinctive.
