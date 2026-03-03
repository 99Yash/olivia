'use client';

import { SubmitJobForm } from '~/components/forms/submit-job';
import { Resume } from '~/db/schemas/resume';
import { Job } from '~/db/schemas/job';
import { usePollJobs } from '~/hooks/use-poll-jobs';
import { BaseResumeCard } from './base-resume-card';
import { JobList } from './job-list';

export function DashboardClient({
  baseResume,
  initialJobs,
}: {
  baseResume: Resume | null;
  initialJobs: Job[];
}) {
  const { jobs, addJob } = usePollJobs(initialJobs);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6">
      <BaseResumeCard baseResume={baseResume} />

      {baseResume && <SubmitJobForm onJobCreated={addJob} />}

      <JobList jobs={jobs} />
    </div>
  );
}
