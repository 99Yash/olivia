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

const SIGNAL_LABELS: Record<
  CompanyDesignProfile['evidence'][number]['signal'],
  string
> = {
  color: 'Accent color',
  'heading-type': 'Heading type',
  'body-type': 'Body type',
  spacing: 'Spacing',
};

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
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={enabled ? 'secondary' : 'outline'}
          size="sm"
          aria-label="Open company design details"
        >
          {profile ? (
            <span
              aria-hidden="true"
              className="size-3 rounded-full ring-1 ring-black/10"
              style={{ backgroundColor: profile.colors.primary }}
            />
          ) : (
            <PaletteIcon className="size-4" />
          )}
          {profile ? 'Company style' : 'Find company style'}
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
                      {profile.companyName} design language
                    </h3>
                  </div>
                  {profile.targetRole && (
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      Applied for {profile.targetRole}
                    </p>
                  )}
                </div>
                <Badge variant="outline" className="capitalize">
                  {profile.confidence} confidence
                </Badge>
              </div>
            </div>

            <div className="space-y-4 p-4">
              <div className="flex items-center justify-between gap-4 rounded-lg border bg-background/70 px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium">Use on this resume</p>
                  <p className="text-xs text-muted-foreground">
                    Keep the standard layout available at all times.
                  </p>
                </div>
                <Switch
                  checked={enabled}
                  onCheckedChange={onEnabledChange}
                  aria-label="Use company style"
                />
              </div>

              {profile.confidence === 'low' && (
                <div className="rounded-lg border border-amber-500/25 bg-amber-500/8 px-3 py-2 text-xs text-amber-900 dark:text-amber-200">
                  This style came from the job page. Review it before you use it.
                </div>
              )}

              <div>
                <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Observed and applied
                </p>
                <div className="divide-y rounded-lg border">
                  {profile.evidence.map((item) => (
                    <div
                      key={item.signal}
                      className="grid grid-cols-[6.5rem_1fr] gap-3 px-3 py-2.5 text-xs"
                    >
                      <div className="font-medium">
                        {SIGNAL_LABELS[item.signal]}
                      </div>
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          {item.signal === 'color' &&
                            /^#[0-9a-f]{6}$/i.test(item.observed) && (
                            <span
                              className="size-2.5 shrink-0 rounded-full ring-1 ring-black/10"
                              style={{ backgroundColor: item.observed }}
                            />
                          )}
                          <span className="truncate">Found: {item.observed}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {item.signal === 'color' && (
                            <span
                              className="size-2.5 shrink-0 rounded-full ring-1 ring-black/10"
                              style={{ backgroundColor: item.applied }}
                            />
                          )}
                          <span className="truncate">PDF: {item.applied}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {profile.traits.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {profile.traits.map((trait) => (
                    <Badge key={trait} variant="secondary">
                      {trait}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <ShieldCheckIcon className="mt-0.5 size-3.5 shrink-0" />
                <p>{profile.rationale}</p>
              </div>

              <div className="flex items-center justify-between gap-2 border-t pt-3">
                <Button variant="ghost" size="sm" asChild>
                  <a
                    href={profile.source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLinkIcon className="size-3.5" />
                    View source
                  </a>
                </Button>
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
              <h3 className="text-sm font-semibold">Find the company style</h3>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Olivia will check public design-system and company sources. It will
              use only safe color, type, spacing, and layout signals.
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
              {discovering ? 'Checking public sources...' : 'Find design system'}
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
