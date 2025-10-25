import { headers } from 'next/headers';
import Link from 'next/link';
import { buttonVariants } from '~/components/ui/button';
import { HandOfGod } from '~/components/ui/icons';
import { UserDropdown } from '~/components/utils/user-ddm';
import { auth } from '~/lib/auth/server';
import { siteConfig } from '~/lib/site';
import { cn } from '~/lib/utils';

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });

  return (
    <div className="flex h-full items-center justify-center overflow-hidden bg-background">
      {session && (
        <div className="absolute right-4 top-4">
          <UserDropdown user={session.user} />
        </div>
      )}
      {/* Decorative gradient burst - top left */}

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

        {session ? (
          <Link href="/upload">Upload resume</Link>
        ) : (
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
        )}
      </main>
    </div>
  );
}
