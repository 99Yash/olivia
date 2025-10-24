import Link from 'next/link';
import { Button } from '~/components/ui/button';

export default function Home() {
  return (
    <div className="relative flex h-full items-center justify-center overflow-hidden bg-background">
      {/* Decorative gradient burst - top left */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-64 w-64 rounded-full bg-linear-to-br from-rose-400/35 via-pink-400/20 to-transparent blur-3xl dark:from-rose-500/25 dark:via-pink-500/10" />

      {/* Decorative gradient burst - top right */}
      <div className="pointer-events-none absolute -right-32 -top-40 h-80 w-80 rounded-full bg-linear-to-bl from-violet-400/35 via-purple-400/20 to-transparent blur-3xl dark:from-violet-500/25 dark:via-purple-500/10" />

      {/* Decorative gradient burst - bottom left */}
      <div className="pointer-events-none absolute -bottom-32 -left-40 h-80 w-80 rounded-full bg-linear-to-tr from-cyan-400/35 via-sky-400/20 to-transparent blur-3xl dark:from-cyan-500/25 dark:via-sky-500/10" />

      {/* Decorative gradient burst - bottom right */}
      <div className="pointer-events-none absolute -bottom-40 -right-32 h-72 w-72 rounded-full bg-linear-to-tl from-fuchsia-400/35 via-pink-400/20 to-transparent blur-3xl dark:from-fuchsia-500/25 dark:via-pink-500/10" />

      {/* Decorative gradient burst - center top */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-96 w-96 rounded-full bg-linear-to-b from-indigo-400/25 via-blue-400/15 to-transparent blur-3xl dark:from-indigo-500/15 dark:via-blue-500/8" />

      {/* Decorative gradient burst - center left */}
      <div className="pointer-events-none absolute left-1/4 top-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-linear-to-r from-amber-400/20 via-orange-400/10 to-transparent blur-3xl dark:from-amber-500/12 dark:via-orange-500/6" />

      {/* Decorative gradient burst - center right */}
      <div className="pointer-events-none absolute right-1/4 top-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-linear-to-l from-green-400/20 via-emerald-400/10 to-transparent blur-3xl dark:from-green-500/12 dark:via-emerald-500/6" />

      <main className="relative z-10 flex w-full max-w-4xl flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-12">
          <h1 className="mb-6 text-6xl font-bold tracking-tight text-foreground sm:text-7xl lg:text-8xl">
            Olivia
          </h1>
          <p className="text-xl text-muted-foreground sm:text-2xl lg:text-3xl">
            The most sophisticated AI assistant for building your resume
          </p>
        </div>

        <div className="mb-12 max-w-2xl">
          <p className="text-lg leading-relaxed text-muted-foreground">
            Transform your career with AI-powered resume building. Create
            professional, ATS-optimized resumes that stand out to employers and
            land you your dream job.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Button asChild size="lg" className="px-8 py-4 text-lg font-semibold">
            <Link href="/signin">Get Started</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
