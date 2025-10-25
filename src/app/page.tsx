import Link from 'next/link';
import { buttonVariants } from '~/components/ui/button';
import { HandOfGod } from '~/components/ui/icons';
import { siteConfig } from '~/lib/site';
import { cn } from '~/lib/utils';

export default function Home() {
  return (
    <div className="relative flex h-full items-center justify-center overflow-hidden bg-background">
      {/* Decorative gradient burst - top left */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-64 w-64 rounded-full bg-linear-to-br from-rose-400/25 via-pink-400/15 to-transparent blur-3xl dark:from-rose-500/40 dark:via-pink-500/25" />

      {/* Decorative gradient burst - top right */}
      <div className="pointer-events-none absolute -right-32 -top-40 h-80 w-80 rounded-full bg-linear-to-bl from-violet-400/25 via-purple-400/15 to-transparent blur-3xl dark:from-violet-500/40 dark:via-purple-500/25" />

      {/* Decorative gradient burst - bottom left */}
      <div className="pointer-events-none absolute -bottom-32 -left-40 h-80 w-80 rounded-full bg-linear-to-tr from-cyan-400/25 via-sky-400/15 to-transparent blur-3xl dark:from-cyan-500/40 dark:via-sky-500/25" />

      {/* Decorative gradient burst - bottom right */}
      <div className="pointer-events-none absolute -bottom-40 -right-32 h-72 w-72 rounded-full bg-linear-to-tl from-fuchsia-400/25 via-pink-400/15 to-transparent blur-3xl dark:from-fuchsia-500/40 dark:via-pink-500/25" />

      {/* Decorative gradient burst - center top */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-96 w-96 rounded-full bg-linear-to-b from-indigo-400/20 via-blue-400/12 to-transparent blur-3xl dark:from-indigo-500/35 dark:via-blue-500/20" />

      {/* Decorative gradient burst - center left */}
      <div className="pointer-events-none absolute left-1/4 top-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-linear-to-r from-amber-400/15 via-orange-400/8 to-transparent blur-3xl dark:from-amber-500/30 dark:via-orange-500/15" />

      {/* Decorative gradient burst - center right */}
      <div className="pointer-events-none absolute right-1/4 top-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-linear-to-l from-green-400/15 via-emerald-400/8 to-transparent blur-3xl dark:from-green-500/30 dark:via-emerald-500/15" />

      {/* Background SVG */}
      <div className="pointer-events-none absolute inset-0 z-0 flex items-start justify-center overflow-hidden pt-8">
        <div className="w-full max-w-7xl opacity-15 transition-all hover:opacity-25 dark:opacity-30 dark:hover:opacity-40">
          <HandOfGod className="w-full scale-150" />
        </div>
      </div>

      <main className="relative z-10 flex w-full max-w-4xl flex-col items-center justify-center px-6 py-8 text-center">
        <div className="mb-8">
          <h1
            className="mb-6 text-foreground text-6xl font-bold tracking-tight sm:text-7xl lg:text-8xl"
            style={{ textWrap: 'balance', letterSpacing: '-0.04em' }}
          >
            {siteConfig.name}
          </h1>
          <p
            className="text-xl text-muted-foreground tracking-tighter sm:text-2xl lg:text-3xl"
            style={{ textWrap: 'balance' }}
          >
            The most{' '}
            <span className="relative inline-block rounded-md bg-linear-to-r from-violet-500/10 via-fuchsia-500/10 to-pink-500/10 px-2 py-0.5 font-medium">
              sophisticated
            </span>{' '}
            AI assistant for building your{' '}
            <span className="relative inline-block">
              resume
              <span
                className="absolute -bottom-1 left-0 right-0 -z-10 h-3 blur-sm"
                style={{
                  background:
                    'linear-gradient(to right, rgba(168, 85, 247, 0.3), rgba(217, 70, 239, 0.3), rgba(236, 72, 153, 0.3))',
                }}
              />
            </span>
          </p>
        </div>

        <div className="mb-8 max-w-2xl">
          <p
            className="md:text-lg font-medium leading-relaxed text-muted-foreground"
            style={{ textWrap: 'pretty' }}
          >
            Transform your career with{' '}
            <span className="font-semibold text-foreground">
              AI-powered resumes
            </span>
            . Create professional, ATS-optimized resumes that stand out and
            actually get you hired.
          </p>
        </div>

        <Link
          className={cn(
            buttonVariants({ variant: 'default', size: 'lg' }),
            'group px-8 py-4 text-lg font-semibold tracking-tight shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30'
          )}
          href="/signin"
        >
          Upload resume
          <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">
            →
          </span>
        </Link>
      </main>
    </div>
  );
}
