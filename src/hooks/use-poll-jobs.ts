'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Job } from '~/db/schemas/job';

const TERMINAL_STATUSES = new Set(['complete', 'invalid', 'error']);
const POLL_INTERVAL = 4000;

export function usePollJobs(initialJobs: Job[]) {
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const hasActiveJobs = jobs.some((j) => !TERMINAL_STATUSES.has(j.status));

  const refetch = useCallback(async () => {
    try {
      const res = await fetch('/api/jobs');
      if (res.ok) {
        const data: Job[] = await res.json();
        setJobs(data);
      }
    } catch {
      // Silently ignore polling errors
    }
  }, []);

  const addJob = useCallback((job: Job) => {
    setJobs((prev) => [job, ...prev]);
  }, []);

  useEffect(() => {
    if (hasActiveJobs) {
      intervalRef.current = setInterval(refetch, POLL_INTERVAL);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [hasActiveJobs, refetch]);

  return { jobs, addJob, refetch };
}
