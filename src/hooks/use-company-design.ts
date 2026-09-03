'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  companyDesignResponseSchema,
  type CompanyDesignProfile,
  type CompanyDesignStatus,
} from '~/lib/schemas/company-design';

const DISCOVERY_POLL_MS = 3_000;

async function readCompanyDesignResponse(response: Response) {
  const parsed = companyDesignResponseSchema.safeParse(await response.json());
  return parsed.success ? parsed.data : null;
}

function readErrorBody(body: unknown) {
  if (!body || typeof body !== 'object') return {};
  const record = body as Record<string, unknown>;
  return {
    message: typeof record.error === 'string' ? record.error : undefined,
    code: typeof record.code === 'string' ? record.code : undefined,
  };
}

export function useCompanyDesign({
  jobId,
  active,
  enabled,
  onEnabledChange,
}: {
  jobId: string | null;
  active: boolean;
  enabled: boolean | undefined;
  onEnabledChange: (enabled: boolean) => void;
}) {
  const [profile, setProfile] = useState<CompanyDesignProfile | null>(null);
  const [status, setStatus] = useState<CompanyDesignStatus>('idle');
  const [requesting, setRequesting] = useState(false);

  // Keep the toggle callbacks out of the effect dependencies. A dependency on
  // `enabled` makes the load effect run a second time after it sets the default.
  const enabledRef = useRef(enabled);
  const onEnabledChangeRef = useRef(onEnabledChange);
  useEffect(() => {
    enabledRef.current = enabled;
    onEnabledChangeRef.current = onEnabledChange;
  });

  const load = useCallback(async (id: string, signal: AbortSignal) => {
    try {
      const response = await fetch(`/api/jobs/${id}/design-system`, { signal });
      if (!response.ok) return;
      const body = await readCompanyDesignResponse(response);
      if (!body || signal.aborted) return;
      setProfile(body.profile);
      setStatus(body.status);
      if (enabledRef.current === undefined && body.profile) {
        onEnabledChangeRef.current(body.profile.overallConfidence !== 'low');
      }
    } catch {
      // Design data is optional and must not block the resume.
    }
  }, []);

  useEffect(() => {
    if (!active || !jobId) {
      setProfile(null);
      setStatus('idle');
      return;
    }

    const controller = new AbortController();
    void load(jobId, controller.signal);
    return () => controller.abort();
  }, [active, jobId, load]);

  // A run started elsewhere, or before a reload, still holds the server lock.
  // Poll until it ends so the popover shows the result without a second click.
  useEffect(() => {
    if (!active || !jobId || status !== 'discovering') return;

    const controller = new AbortController();
    const timer = setInterval(() => {
      void load(jobId, controller.signal);
    }, DISCOVERY_POLL_MS);

    return () => {
      controller.abort();
      clearInterval(timer);
    };
  }, [active, jobId, load, status]);

  const refresh = useCallback(async () => {
    if (!jobId) return;
    setRequesting(true);
    try {
      const response = await fetch(`/api/jobs/${jobId}/design-system`, {
        method: 'POST',
      });
      if (!response.ok) {
        const { message, code } = readErrorBody(
          await response.json().catch(() => null)
        );
        // Another run holds the lock. Watch that run instead of a new one.
        if (code === 'discovery_in_progress') setStatus('discovering');
        toast.error(
          message ?? 'Could not find a reliable public design source.'
        );
        return;
      }
      const body = await readCompanyDesignResponse(response);
      if (!body?.profile) {
        toast.error('Received an invalid company design profile.');
        setStatus('error');
        return;
      }
      setProfile(body.profile);
      setStatus(body.status);
      onEnabledChangeRef.current(body.profile.overallConfidence !== 'low');
      toast.success('Company-informed design is ready.');
    } catch {
      toast.error('Could not find a reliable public design source.');
    } finally {
      setRequesting(false);
    }
  }, [jobId]);

  return {
    profile,
    status,
    discovering: requesting || status === 'discovering',
    refresh,
  };
}
