'use client';

import React from 'react';
import { Button } from '~/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '~/components/ui/tooltip';
import type { ToolbarOption } from './types';

export function Toolbar({
  options,
  disabled = false,
}: {
  options: ToolbarOption[];
  disabled?: boolean;
}) {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5">
      {options.map((option) => {
        if (option.separator) {
          return (
            <div
              key={option.id}
              className="shrink-0 w-[0.5px] mx-0.5 h-3 bg-border/40"
            />
          );
        }
        const Icon = option.icon;
        return (
          <Tooltip key={option.id}>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={disabled || option.disabled}
                className={`size-6 transition-colors ${
                  option.isActive
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-muted-foreground/70 hover:bg-muted/30 hover:text-muted-foreground'
                }`}
                aria-label={option.label}
                onMouseDown={handleMouseDown}
                onClick={option.onClick}
              >
                <Icon className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{option.label}</p>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
