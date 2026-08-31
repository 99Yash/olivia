'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  companyDesignResponseSchema,
  type CompanyDesignProfile,
} from '~/lib/schemas/company-design';

async function readCompanyDesignResponse(response: Response) {
  const parsed = companyDesignResponseSchema.safeParse(await response.json());
  return parsed.success ? parsed.data.profile : null;
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
  const [discovering, setDiscovering] = useState(false);

  useEffect(() => {
    if (!active || !jobId) {
      setProfile(null);
      return;
    }

    const controller = new AbortController();
    void fetch(`/api/jobs/${jobId}/design-system`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) return;
        const nextProfile = await readCompanyDesignResponse(response);
        if (controller.signal.aborted) return;
        setProfile(nextProfile);
        if (enabled === undefined) {
          onEnabledChange(
            nextProfile?.overallConfidence !== 'low' && !!nextProfile
          );
        }
      })
      .catch(() => {
        // Design data is optional and must not block the resume.
      });

    return () => controller.abort();
  }, [active, enabled, jobId, onEnabledChange]);

  const refresh = useCallback(async () => {
    if (!jobId) return;
    setDiscovering(true);
    try {
      const response = await fetch(`/api/jobs/${jobId}/design-system`, {
        method: 'POST',
      });
      if (!response.ok) {
        const body: unknown = await response.json().catch(() => null);
        const message =
          body &&
          typeof body === 'object' &&
          'error' in body &&
          typeof body.error === 'string'
            ? body.error
            : 'Could not find a reliable public design source.';
        toast.error(message);
        return;
      }
      const nextProfile = await readCompanyDesignResponse(response);
      if (!nextProfile) {
        toast.error('Received an invalid company design profile.');
        return;
      }
      setProfile(nextProfile);
      onEnabledChange(nextProfile.overallConfidence !== 'low');
      toast.success('Company-informed design is ready.');
    } catch {
      toast.error('Could not find a reliable public design source.');
    } finally {
      setDiscovering(false);
    }
  }, [jobId, onEnabledChange]);

  return { profile, discovering, refresh };
}
