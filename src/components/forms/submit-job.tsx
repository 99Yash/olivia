'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { LinkIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { submitJobAction } from '~/app/dashboard/actions';
import { Job } from '~/db/schemas/job';
import { Button } from '../ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';

const submitJobSchema = z.object({
  url: z.url('Please enter a valid URL'),
});

type SubmitJobValues = z.infer<typeof submitJobSchema>;

export function SubmitJobForm({
  onJobCreated,
}: {
  onJobCreated: (job: Job) => void;
}) {
  const form = useForm<SubmitJobValues>({
    resolver: zodResolver(submitJobSchema),
    defaultValues: { url: '' },
  });

  const onSubmit = async (values: SubmitJobValues) => {
    const result = await submitJobAction(values.url);

    if ('error' in result) {
      toast.error(result.error);
      return;
    }

    // Optimistically add the job to the list
    onJobCreated({
      id: result.jobId,
      url: values.url,
      title: null,
      userId: '',
      status: 'pending',
      content: null,
      designProfile: null,
      designStatus: 'idle',
      analyzedAt: null,
      invalidReason: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } satisfies Job);

    form.reset();
    toast.success('Job submitted! Tailoring will begin shortly.');
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex items-start gap-2"
      >
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Input
                  placeholder="Paste a job listing URL..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          size="default"
        >
          <LinkIcon className="size-4" />
          {form.formState.isSubmitting ? 'Submitting...' : 'Tailor'}
        </Button>
      </form>
    </Form>
  );
}
