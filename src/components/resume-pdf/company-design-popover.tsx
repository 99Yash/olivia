'use client';

import {
  ExternalLinkIcon,
  PaletteIcon,
  RefreshCwIcon,
  ShieldCheckIcon,
} from 'lucide-react';
import type { CompanyDesignProfile } from '~/lib/schemas/company-design';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import { Switch } from '../ui/switch';

function signalRows(profile: CompanyDesignProfile) {
  return [
    {
      key: 'accent',
      label: 'Accent color',
      observed: profile.accent.observed ?? 'No verified color',
      applied: profile.accent.applied,
      transformation: profile.accent.transformation,
      evidence: profile.accent.evidence,
      color: true,
    },
    {
      key: 'typography',
      label: 'Typography',
      observed:
        profile.typography.observed.headingFamily ??
        profile.typography.observed.bodyFamily ??
        `${profile.typography.observed.character} character`,
      applied: profile.typography.applied.safeFamily,
      transformation: profile.typography.transformation,
      evidence: profile.typography.evidence,
      color: false,
    },
    {
      key: 'spacing',
      label: 'Spacing',
      observed:
        profile.spacingUnit.observed === null
          ? 'No verified unit'
          : `${profile.spacingUnit.observed} point unit`,
      applied: `${profile.spacingUnit.applied} point rhythm`,
      transformation: profile.spacingUnit.transformation,
      evidence: profile.spacingUnit.evidence,
      color: false,
    },
  ];
}

export function CompanyDesignPopover({
  profile,
  enabled,
  discovering,
  onEnabledChange,
  onRefresh,
}: {
  profile: CompanyDesignProfile | null;
  enabled: boolean;
  discovering: boolean;
  onEnabledChange: (enabled: boolean) => void;
  onRefresh: () => void;
}) {
  const rows = profile ? signalRows(profile) : [];
  const sourceUrl = rows[0]?.evidence[0]?.url ?? profile?.officialUrl;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={enabled ? 'secondary' : 'outline'}
          size="sm"
          aria-label="Open company-informed design details"
        >
          {profile ? (
            <span
              aria-hidden="true"
              className="size-3 rounded-full ring-1 ring-black/10"
              style={{ backgroundColor: profile.accent.applied }}
            />
          ) : (
            <PaletteIcon className="size-4" />
          )}
          {profile ? 'Company-informed design' : 'Find company design'}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="company-design-popover w-[min(26rem,calc(100vw-2rem))] overflow-hidden border-white/40 bg-popover/95 p-0 shadow-xl backdrop-blur-xl"
      >
        {profile ? (
          <div>
            <div className="border-b bg-muted/35 px-4 py-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <PaletteIcon className="size-4 shrink-0" />
                    <h3 className="truncate text-sm font-semibold">
                      {profile.companyName} public design signals
                    </h3>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Identity: {profile.identityConfidence} confidence
                  </p>
                </div>
                <Badge variant="outline" className="capitalize">
                  {profile.overallConfidence} confidence
                </Badge>
              </div>
            </div>

            <div className="space-y-4 p-4">
              <div className="flex items-center justify-between gap-4 rounded-lg border bg-background/70 px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium">
                    Use company-informed design
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Turn this off to restore the standard resume design.
                  </p>
                </div>
                <Switch
                  checked={enabled}
                  onCheckedChange={onEnabledChange}
                  aria-label="Use company-informed design"
                />
              </div>

              {profile.overallConfidence === 'low' && (
                <div className="rounded-lg border border-amber-500/25 bg-amber-500/8 px-3 py-2 text-xs text-amber-900 dark:text-amber-200">
                  This design is not selected by default. Review its source before
                  you use it.
                </div>
              )}

              <div>
                <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Observed and applied
                </p>
                <div className="divide-y rounded-lg border">
                  {rows.map((item) => (
                    <div
                      key={`${item.key}:${item.evidence[0]?.url ?? 'unknown'}`}
                      className="grid grid-cols-[6.5rem_1fr] gap-3 px-3 py-2.5 text-xs"
                    >
                      <div className="font-medium">{item.label}</div>
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          {item.color && /^#[0-9a-f]{6}$/i.test(item.observed) && (
                            <span
                              className="size-2.5 shrink-0 rounded-full ring-1 ring-black/10"
                              style={{ backgroundColor: item.observed }}
                            />
                          )}
                          <span className="truncate">Found: {item.observed}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {item.color && (
                            <span
                              className="size-2.5 shrink-0 rounded-full ring-1 ring-black/10"
                              style={{ backgroundColor: item.applied }}
                            />
                          )}
                          <span className="truncate">PDF: {item.applied}</span>
                        </div>
                        {item.transformation && (
                          <p className="text-muted-foreground">
                            {item.transformation}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {profile.warnings.map((warning) => (
                <p
                  key={warning}
                  className="rounded-md border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs"
                >
                  {warning}
                </p>
              ))}

              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <ShieldCheckIcon className="mt-0.5 size-3.5 shrink-0" />
                <p>
                  Public signals are mapped to safe resume values. Company marks
                  and external fonts are not copied.
                </p>
              </div>

              <div className="flex items-center justify-between gap-2 border-t pt-3">
                {sourceUrl && (
                  <Button variant="ghost" size="sm" asChild>
                    <a
                      href={sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLinkIcon className="size-3.5" />
                      View source
                    </a>
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={discovering}
                  onClick={onRefresh}
                >
                  <RefreshCwIcon
                    className={`size-3.5 ${discovering ? 'animate-spin' : ''}`}
                  />
                  {discovering ? 'Checking...' : 'Check again'}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4">
            <div className="flex items-center gap-2">
              <PaletteIcon className="size-4" />
              <h3 className="text-sm font-semibold">
                Find company-informed design
              </h3>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Olivia will check official public sources and map a small set of
              signals to an ATS-safe resume design.
            </p>
            <Button
              className="mt-4 w-full"
              size="sm"
              disabled={discovering}
              onClick={onRefresh}
            >
              <RefreshCwIcon
                className={`size-3.5 ${discovering ? 'animate-spin' : ''}`}
              />
              {discovering ? 'Checking public sources...' : 'Find public design'}
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
